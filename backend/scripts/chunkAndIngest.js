// Violet Yousif, 7/3/2025, Added to handle file chunking and ingestion from various formats

import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import fs from 'fs';
import csvParser from 'csv-parser';
import ExcelJS from 'exceljs';
import Tesseract from 'tesseract.js';

/**
 * Load and extract clean article text from a URL.
 */
async function loadFromURL(url) {
  console.log(`Fetching from URL: ${url}`);
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; MethuselahBot/1.0)',
      'Accept': 'text/html,application/json;q=0.9,*/*;q=0.8'
    }
  });
  const contentType = response.headers.get('content-type');

  if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);

  if (contentType.includes('application/pdf')) {
    const buffer = Buffer.from(await response.arrayBuffer());
    return await loadPDF(buffer);
  }

  if (contentType.includes('text/plain')) {
    return await response.text();
  }

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

/**
 * Load PDF file from disk or buffer.
 */
async function loadPDF(filePathOrBuffer) {
  const { default: pdfParse } = await import('pdf-parse');

  const buffer = typeof filePathOrBuffer === 'string'
    ? fs.readFileSync(filePathOrBuffer)
    : filePathOrBuffer;

  const pdf = await pdfParse(buffer);
  return pdf.text;
}

/**
 * Load plain text file.
 */
function loadTXT(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Load and flatten CSV content.
 */
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

/**
 * Load and flatten JSON file.
 */
function loadJSON(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return Array.isArray(data) ? data.map(JSON.stringify).join('\n') : JSON.stringify(data);
}

/**
 * Load and flatten Excel (XLS/XLSX) file.
 */
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

/**
 * Extract text from image using OCR.
 */
async function loadImageText(filePath) {
  const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
  return text;
}

/**
 * Split a long text into smaller chunks by sentence.
 */
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

/**
 * Mocked function for embedding and storing chunks.
 */
async function embedAndStoreChunks(chunks, sourceName) {
  console.log(`🔗 Pretending to embed and store ${chunks.length} chunks from ${sourceName}...`);
  for (let i = 0; i < Math.min(chunks.length, 3); i++) {
    console.log(`  • Chunk ${i + 1}:`, chunks[i].slice(0, 80) + '...');
  }
}

/**
 * Mock Mongo client
 */
const client = {
  close: async () => console.log('MongoDB connection closed (mock).')
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
  client
};
