// Violet Yousif, 7/3/2025, Added to handle file chunking and ingestion from various formats



import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import fs from 'fs';
import csvParser from 'csv-parser';
import ExcelJS from 'exceljs';
import Tesseract from 'tesseract.js';
import { MongoClient } from 'mongodb';
import { InferenceClient } from '@huggingface/inference';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env.local' });

const hf = new InferenceClient(process.env.HF_API_KEY);
const EMBEDDING_MODEL = 'BAAI/bge-small-en-v1.5';

// Initialize these only when needed
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

/** Load and extract clean article text from a URL. */
async function loadFromURL(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; MethuselahBot/1.0)',
      'Accept': 'text/html,application/json;q=0.9,*/*;q=0.8'
    }
  });
  const contentType = response.headers.get('content-type');
  if (!response.ok) {
    console.error(`Error fetching: ${response.status} ${response.statusText}`);
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

async function loadPDF(filePathOrBuffer) {
  const { default: pdfParse } = await import('pdf-parse');
  const buffer = typeof filePathOrBuffer === 'string' ? fs.readFileSync(filePathOrBuffer) : filePathOrBuffer;
  const pdf = await pdfParse(buffer);
  return pdf.text;
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
      currentChunk = '';
    }
    currentChunk += sentence;
  }
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

async function embedAndStoreChunks(chunks, sourceName) {
  try {
    // Initialize MongoDB connection when needed
    await initializeMongo();
    
    const embeddings = await Promise.all(
      chunks.map(async (text) => {
        const output = await hf.featureExtraction({ model: EMBEDDING_MODEL, inputs: text });
        return output;
      })
    );

    const docs = chunks.map((text, i) => ({
      source: sourceName,
      text,
      embedding: embeddings[i],
      timestamp: new Date()
    }));

    await kb.insertMany(docs);
    console.log(`✅ Stored ${docs.length} documents to KnowledgeBase from ${sourceName}`);
  } catch (err) {
    console.error(`[Embedding Error] ${err.message}`);
    throw err;
  }
}

// Export a function to get the client instead of the client itself
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
// import { InferenceClient } from '@huggingface/inference';
// import dotenv from 'dotenv';
// dotenv.config({ path: './backend/.env.local' });

// const hf = new InferenceClient(process.env.HF_API_KEY);
// const EMBEDDING_MODEL = 'BAAI/bge-small-en-v1.5';

// /** Load and extract clean article text from a URL. */
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

//   if (contentType.includes('application/pdf')) {
//     const buffer = Buffer.from(await response.arrayBuffer());
//     return await loadPDF(buffer);
//   }
//   if (contentType.includes('text/plain')) return await response.text();
//   if (contentType.includes('application/json')) {
//     const json = await response.json();
//     return Array.isArray(json) ? json.map(JSON.stringify).join('\n') : JSON.stringify(json);
//   }
//   if (contentType.includes('text/html')) {
//     const html = await response.text();
//     const dom = new JSDOM(html, { url });
//     const reader = new Readability(dom.window.document);
//     const article = reader.parse();
//     return article?.textContent || '';
//   }
//   throw new Error(`Unsupported content-type from URL: ${contentType}`);
// }

// async function loadPDF(filePathOrBuffer) {
//   const { default: pdfParse } = await import('pdf-parse');
//   const buffer = typeof filePathOrBuffer === 'string' ? fs.readFileSync(filePathOrBuffer) : filePathOrBuffer;
//   const pdf = await pdfParse(buffer);
//   return pdf.text;
// }

// function loadTXT(filePath) {
//   return fs.readFileSync(filePath, 'utf-8');
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
//   return Array.isArray(data) ? data.map(JSON.stringify).join('\n') : JSON.stringify(data);
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
//       currentChunk = '';
//     }
//     currentChunk += sentence;
//   }
//   if (currentChunk) chunks.push(currentChunk.trim());
//   return chunks;
// }

// const mongo = new MongoClient(process.env.MONGODB_URI);
// await mongo.connect();
// const kb = mongo.db('Longevity').collection('KnowledgeBase');

// async function embedAndStoreChunks(chunks, sourceName) {
//   try {
//     const embeddings = await Promise.all(
//       chunks.map(async (text) => {
//         const output = await hf.featureExtraction({ model: EMBEDDING_MODEL, inputs: text });
//         return output;
//       })
//     );

//     const docs = chunks.map((text, i) => ({
//       source: sourceName,
//       text,
//       embedding: embeddings[i],
//       timestamp: new Date()
//     }));

//     await kb.insertMany(docs);
//   } catch (err) {
//     console.error(`[Embedding Error] ${err.message}`);
//     throw err;
//   }
// }

// const client = mongo;

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
//   client
// };

// import fetch from 'node-fetch';
// import { JSDOM } from 'jsdom';
// import { Readability } from '@mozilla/readability';
// import fs from 'fs';
// import csvParser from 'csv-parser';
// import ExcelJS from 'exceljs';
// import Tesseract from 'tesseract.js';

// /**
//  * Load and extract clean article text from a URL.
//  */
// async function loadFromURL(url) {
//   console.log(`Fetching from URL: ${url}`);
//   const response = await fetch(url, {
//     headers: {
//       'User-Agent': 'Mozilla/5.0 (compatible; MethuselahBot/1.0)',
//       'Accept': 'text/html,application/json;q=0.9,*/*;q=0.8'
//     }
//   });
//   const contentType = response.headers.get('content-type');

//   if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);

//   if (contentType.includes('application/pdf')) {
//     const buffer = Buffer.from(await response.arrayBuffer());
//     return await loadPDF(buffer);
//   }

//   if (contentType.includes('text/plain')) {
//     return await response.text();
//   }

//   if (contentType.includes('application/json')) {
//     const json = await response.json();
//     return Array.isArray(json) ? json.map(JSON.stringify).join('\n') : JSON.stringify(json);
//   }

//   if (contentType.includes('text/html')) {
//     const html = await response.text();
//     const dom = new JSDOM(html, { url });
//     const reader = new Readability(dom.window.document);
//     const article = reader.parse();
//     return article?.textContent || '';
//   }

//   throw new Error(`Unsupported content-type from URL: ${contentType}`);
// }

// /**
//  * Load PDF file from disk or buffer.
//  */
// async function loadPDF(filePathOrBuffer) {
//   const { default: pdfParse } = await import('pdf-parse');

//   const buffer = typeof filePathOrBuffer === 'string'
//     ? fs.readFileSync(filePathOrBuffer)
//     : filePathOrBuffer;

//   const pdf = await pdfParse(buffer);
//   return pdf.text;
// }

// /**
//  * Load plain text file.
//  */
// function loadTXT(filePath) {
//   return fs.readFileSync(filePath, 'utf-8');
// }

// /**
//  * Load and flatten CSV content.
//  */
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

// /**
//  * Load and flatten JSON file.
//  */
// function loadJSON(filePath) {
//   const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
//   return Array.isArray(data) ? data.map(JSON.stringify).join('\n') : JSON.stringify(data);
// }

// /**
//  * Load and flatten Excel (XLS/XLSX) file.
//  */
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

// /**
//  * Extract text from image using OCR.
//  */
// async function loadImageText(filePath) {
//   const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
//   return text;
// }

// /**
//  * Split a long text into smaller chunks by sentence.
//  */
// function chunkText(text, chunkSize = 500) {
//   const sentences = text.match(/[^.!?]+[.!?]*/g) || [];
//   const chunks = [];
//   let currentChunk = '';

//   for (const sentence of sentences) {
//     if ((currentChunk + sentence).length > chunkSize) {
//       chunks.push(currentChunk.trim());
//       currentChunk = '';
//     }
//     currentChunk += sentence;
//   }

//   if (currentChunk) chunks.push(currentChunk.trim());
//   return chunks;
// }

// /* Function for embedding and storing chunks. */
// async function embedAndStoreChunks(chunks, sourceName) {
//   console.log(`Pretending to embed and store ${chunks.length} chunks from ${sourceName}...`);
//   for (let i = 0; i < Math.min(chunks.length, 3); i++) {
//     console.log(`  • Chunk ${i + 1}:`, chunks[i].slice(0, 80) + '...');
//   }
// }

// /* Mongo client */
// const client = {
//   close: async () => console.log('MongoDB connection closed (mock).')
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
//   client
// };
