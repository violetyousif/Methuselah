// Violet Yousif, 7/3/2025, Added runIngest script to handle file ingestion

import path from 'path';
import { fileURLToPath } from 'url';
import {
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
} from './chunkAndIngest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPathOrUrl = process.argv[2];

if (!inputPathOrUrl) {
    console.error('Please provide a file path or URL to ingest.');
    process.exit(1);
}

async function runIngest(inputPathOrUrl) {
    const isUrl =
        inputPathOrUrl.startsWith('http://') ||
        inputPathOrUrl.startsWith('https://');
    const sourceName = isUrl
        ? new URL(inputPathOrUrl).hostname
        : path.basename(inputPathOrUrl);
    let fullText = '';

    try {
        // Check if the input is a URL or a local file
        if (isUrl) {
            fullText = await loadFromURL(inputPathOrUrl);
        } else {
            // If it's a local file, determine the type by extension
            const ext = path.extname(inputPathOrUrl).toLowerCase();
            switch (ext) {
                case '.pdf':
                    fullText = await loadPDF(inputPathOrUrl);
                    break;
                case '.txt':
                    fullText = await loadTXT(inputPathOrUrl);
                    break;
                case '.json':
                    fullText = await loadJSON(inputPathOrUrl);
                    break;
                case '.csv':
                    fullText = await loadCSV(inputPathOrUrl);
                    break;
                case '.xls':
                case '.xlsx':
                    fullText = await loadXLS(inputPathOrUrl);
                    break;
                case '.png':
                case '.jpg':
                case '.jpeg':
                    fullText = await loadImageText(inputPathOrUrl);
                    break;
                default:
                    throw new Error(`Unsupported file type: ${ext}`);
            }
        }

        const chunks = chunkText(fullText, 500);
        await embedAndStoreChunks(chunks, sourceName);
        console.log('Ingestion complete!');
        await client.close();
    } catch (err) {
        console.error('Ingestion failed:', err.message || err);
        process.exit(1);
    }

}

runIngest(inputPathOrUrl);
