//import pdfParse from 'pdf-parse';
import { parse as csvParse } from 'csv-parse/sync';

export async function extractTextFromFile(buffer, mimetype, originalName) {
  try {
    // if (mimetype === 'application/pdf' || originalName.endsWith('.pdf')) {
    //   // PDF
    //   const data = await pdfParse(buffer);
    //   return data.text || '';
    // }
    if (
      mimetype === 'text/plain' ||
      originalName.endsWith('.txt')
    ) {
      // Plain text
      return buffer.toString('utf8');
    }
    if (
      mimetype === 'text/csv' ||
      originalName.endsWith('.csv')
    ) {
      // CSV
      const csvString = buffer.toString('utf8');
      const records = csvParse(csvString, { columns: false });
      return records.map(row => row.join(', ')).join('\n');
    }
    // Add more types as needed (e.g., docx, xlsx)
    return '';
  } catch (err) {
    console.error('extractTextFromFile error:', err);
    return '';
  }
}
