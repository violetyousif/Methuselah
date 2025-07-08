// Violet Yousif, 7/3/2025, Added to handle file chunking and ingestion from various formats

// chunkAndIngest.js
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import fs from 'fs';
import csvParser from 'csv-parser';
import ExcelJS from 'exceljs';
import Tesseract from 'tesseract.js';
import { MongoClient } from 'mongodb';
import pdfjsLib from 'pdfjs-dist';
import { InferenceClient } from '@huggingface/inference';
import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config({ path: '../.env.local' });

const hf = new InferenceClient(process.env.HF_API_KEY);
const EMBEDDING_MODEL = 'BAAI/bge-small-en-v1.5';
const { getDocument } = pdfjsLib;

let mongo;
let kb;

async function initializeMongo() {
  if (!mongo) {
    mongo = new MongoClient(process.env.MONGODB_URI);
    await mongo.connect();
    kb = mongo.db('Longevity').collection('KnowledgeBase');
  }
  return { mongo, kb };
}

function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\.(?=[^\s])/g, '. ')
    .replace(/[\r\n\t]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1. $2')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function normalizeText(text) {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

function getTextHash(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

async function loadFromURL(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; MethuselahBot/1.0)',
      'Accept': 'text/html,application/json;q=0.9,*/*;q=0.8'
    }
  });
  const contentType = response.headers.get('content-type');
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  if (contentType.includes('application/pdf')) {
    const buffer = Buffer.from(await response.arrayBuffer());
    return await loadPDF(buffer);
  }
  if (contentType.includes('text/plain')) return await response.text();
  if (contentType.includes('application/json')) {
    const json = await response.json();
    return Array.isArray(json) ? json.map(JSON.stringify).join('\n') : JSON.stringify(json);
  }
  if (contentType.includes('text/html')) {
    const html = await response.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    return article?.textContent || '';
  }
  throw new Error(`Unsupported content-type from URL: ${contentType}`);
}

async function loadPDF(bufferOrPath) {
  const data = Buffer.isBuffer(bufferOrPath) ? new Uint8Array(bufferOrPath) : new Uint8Array(fs.readFileSync(bufferOrPath));
  const pdf = await getDocument({ data }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map(item => item.str).join(' ');
    fullText += text + '\n';
  }
  return fullText.trim();
}

function loadTXT(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

async function loadCSV(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', data => rows.push(JSON.stringify(data)))
      .on('end', () => resolve(rows.join('\n')))
      .on('error', reject);
  });
}

function loadJSON(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return Array.isArray(data) ? data.map(JSON.stringify).join('\n') : JSON.stringify(data);
}

async function loadXLS(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet(1);
  const json = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      const rowData = {};
      row.eachCell((cell, colNumber) => {
        const header = worksheet.getCell(1, colNumber).value;
        rowData[header || `col${colNumber}`] = cell.value;
      });
      json.push(rowData);
    }
  });
  return json.map(JSON.stringify).join('\n');
}

async function loadImageText(filePath) {
  const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
  return text;
}

function chunkText(text, chunkSize = 500) {
  const sentences = text.match(/[^.!?]+[.!?]*/g) || [];
  const chunks = [];
  let currentChunk = '';
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks.filter(chunk => chunk.length > 100);
}

async function generateTopic(text) {
  try {
    const prompt = `Provide a short topic or category that best summarizes the following content:\n\n${text}\n\nTopic:`;
    const result = await hf.textGeneration({
      model: 'HuggingFaceH4/zephyr-7b-beta',
      inputs: prompt,
      parameters: {
        max_new_tokens: 10,
        return_full_text: false
      }
    });
    return result?.generated_text?.trim() || 'General';
  } catch (error) {
    console.error('Topic generation failed:', error);
    return 'General';
  }
}


async function embedAndStoreChunks(chunks, sourceName) {
  await initializeMongo();
  const docs = [];

  for (const text of chunks) {
    const normalized = normalizeText(text);
    const hash = getTextHash(normalized);
    const exists = await kb.findOne({ hash });
    if (exists) continue;

    const embedding = await hf.featureExtraction({ model: EMBEDDING_MODEL, inputs: text });
    docs.push({
      source: sourceName,
      text,
      embedding,
      hash,
      topic,
      timestamp: new Date(),
    });
  }

  if (docs.length > 0) {
    await kb.insertMany(docs);
    console.log(`SUCCESS: Stored ${docs.length} new unique chunks to KnowledgeBase from ${sourceName}`);
  } else {
    console.log(`INFO: No new unique chunks to store from ${sourceName}`);
  }
}

const getClient = async () => {
  const { mongo } = await initializeMongo();
  return mongo;
};

export {
  loadFromURL,
  loadPDF,
  loadTXT,
  loadCSV,
  loadJSON,
  loadXLS,
  loadImageText,
  chunkText,
  embedAndStoreChunks,
  cleanText,
  getClient
};


// import fetch from 'node-fetch';
// import { JSDOM } from 'jsdom';
// import { Readability } from '@mozilla/readability';
// import fs from 'fs';
// import csvParser from 'csv-parser';
// import ExcelJS from 'exceljs';
// import Tesseract from 'tesseract.js';
// import { MongoClient } from 'mongodb';
// import pdfjsLib from 'pdfjs-dist';
// import { InferenceClient } from '@huggingface/inference';
// import dotenv from 'dotenv';
// dotenv.config({ path: '../.env.local' });

// const hf = new InferenceClient(process.env.HF_API_KEY);
// const EMBEDDING_MODEL = 'BAAI/bge-small-en-v1.5';
// const { getDocument } = pdfjsLib;

// // Initialize these only when needed
// let mongo;
// let kb;

// async function initializeMongo() {
//   if (!mongo) {
//     mongo = new MongoClient(process.env.MONGODB_URI);
//     await mongo.connect();
//     kb = mongo.db('Longevity').collection('KnowledgeBase');
//   }
//   return { mongo, kb };
// }

// function cleanText(text) {
//   return text
//     .replace(/\s+/g, ' ')              // collapse all whitespace
//     .replace(/\.(?=[^\s])/g, '. ')     // fix missing space after periods
//     .replace(/[\r\n\t]/g, ' ')         // remove newlines and tabs
//     .replace(/([a-z])([A-Z])/g, '$1. $2') // separate stuck-together sentences
//     .replace(/\s{2,}/g, ' ')           // extra spaces
//     .trim();
// }

// async function loadFromURL(url) {
//   const response = await fetch(url, {
//     headers: {
//       'User-Agent': 'Mozilla/5.0 (compatible; MethuselahBot/1.0)',
//       'Accept': 'text/html,application/json;q=0.9,*/*;q=0.8'
//     }
//   });
//   const contentType = response.headers.get('content-type');
//   if (!response.ok) {
//     console.error(`Error fetching: ${response.status} ${response.statusText}`);
//     throw new Error(`Failed to fetch: ${response.statusText}`);
//   }

//   let text = '';

//   if (contentType.includes('application/pdf')) {
//     const buffer = Buffer.from(await response.arrayBuffer());
//     text = await loadPDF(buffer);
//   } else if (contentType.includes('text/plain')) {
//     text = await response.text();
//   } else if (contentType.includes('application/json')) {
//     const json = await response.json();
//     text = Array.isArray(json) ? json.map(JSON.stringify).join('\n') : JSON.stringify(json);
//   } else if (contentType.includes('text/html')) {
//     const html = await response.text();
//     const dom = new JSDOM(html, { url });
//     const reader = new Readability(dom.window.document);
//     const article = reader.parse();
//     text = article?.textContent || '';
//   } else {
//     throw new Error(`Unsupported content-type from URL: ${contentType}`);
//   }

//   return cleanText(text);
// }

// async function loadPDF(filePath) {
//   try {
//     if (!fs.existsSync(filePath)) {
//       throw new Error(`File not found: ${filePath}`);
//     }

//     const data = new Uint8Array(fs.readFileSync(filePath));
//     const pdf = await getDocument({ data }).promise;

//     let fullText = '';
//     for (let i = 1; i <= pdf.numPages; i++) {
//       const page = await pdf.getPage(i);
//       const content = await page.getTextContent();
//       const text = content.items.map(item => item.str).join(' ');
//       fullText += text + '\n';
//     }

//     console.log(`[loadPDF] Extracted ${pdf.numPages} pages from ${filePath}`);
//     return fullText.trim();
//   } catch (err) {
//     console.error("Error parsing PDF:", err.message);
//     throw err;
//   }
// }


// function loadTXT(filePath) {
//   const raw = fs.readFileSync(filePath, 'utf-8');
//   return cleanText(raw);
// }

// async function loadCSV(filePath) {
//   return new Promise((resolve, reject) => {
//     const rows = [];
//     fs.createReadStream(filePath)
//       .pipe(csvParser())
//       .on('data', data => rows.push(JSON.stringify(data)))
//       .on('end', () => resolve(rows.join('\n')))
//       .on('error', reject);
//   });
// }

// function loadJSON(filePath) {
//   const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
//   const text = Array.isArray(data) ? data.map(JSON.stringify).join('\n') : JSON.stringify(data);
//   return cleanText(text);
// }

// async function loadXLS(filePath) {
//   const workbook = new ExcelJS.Workbook();
//   await workbook.xlsx.readFile(filePath);
//   const worksheet = workbook.getWorksheet(1);
//   const json = [];
//   worksheet.eachRow((row, rowNumber) => {
//     if (rowNumber > 1) {
//       const rowData = {};
//       row.eachCell((cell, colNumber) => {
//         const header = worksheet.getCell(1, colNumber).value;
//         rowData[header || `col${colNumber}`] = cell.value;
//       });
//       json.push(rowData);
//     }
//   });
//   return json.map(JSON.stringify).join('\n');
// }

// async function loadImageText(filePath) {
//   const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
//   return text;
// }

// function chunkText(text, chunkSize = 500) {
//   const sentences = text.match(/[^.!?]+[.!?]*/g) || [];
//   const chunks = [];
//   let currentChunk = '';

//   for (const sentence of sentences) {
//     if ((currentChunk + sentence).length > chunkSize) {
//       chunks.push(currentChunk.trim());
//       currentChunk = sentence;
//     } else {
//       currentChunk += sentence;
//     }
//   }

//   if (currentChunk) {
//     chunks.push(currentChunk.trim());
//   }

//   return chunks.filter(chunk => chunk.length > 100); // discard very short ones
// }

// async function embedAndStoreChunks(chunks, sourceName) {
//   try {
//     await initializeMongo();

//     const uniqueChunks = [];

//     // Check each chunk to see if it already exists
//     for (const text of chunks) {
//       const exists = await kb.findOne({ text, source: sourceName });
//       if (!exists) {
//         uniqueChunks.push(text);
//       }
//     }

//     if (uniqueChunks.length === 0) {
//       console.log(`[Deduplication] No new unique chunks to store from ${sourceName}.`);
//       return;
//     }

//     // Generate embeddings for only unique chunks
//     const embeddings = await Promise.all(
//       uniqueChunks.map(async (text) => {
//         const output = await hf.featureExtraction({ model: EMBEDDING_MODEL, inputs: text });
//         return output;
//       })
//     );

//     const docs = uniqueChunks.map((text, i) => ({
//       source: sourceName,
//       text,
//       embedding: embeddings[i],
//       timestamp: new Date()
//     }));

//     await kb.insertMany(docs);
//     console.log(`SUCCESS: Stored ${docs.length} new unique chunks to KnowledgeBase from ${sourceName}`);
//   } catch (err) {
//     console.error(`[Embedding Error] ${err.message}`);
//     throw err;
//   }
// }


// // Export a function to get the client instead of the client itself
// const getClient = async () => {
//   const { mongo } = await initializeMongo();
//   return mongo;
// };

// export {
//   loadFromURL,
//   loadPDF,
//   loadTXT,
//   loadCSV,
//   loadJSON,
//   loadXLS,
//   loadImageText,
//   chunkText,
//   embedAndStoreChunks,
//   getClient,
//   cleanText
// };

