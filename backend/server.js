const express = require('express');
const multer = require('multer');
const cors = require('cors');
const ExcelJS = require('exceljs');
const path = require('path');
const { Worker } = require('worker_threads');
const stream = require('stream');

const app = express();

// Increase payload limit for large files
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 500, // 500MB file size limit
  },
});

// Process Excel file in chunks
app.post('/api/process-excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const buffer = req.file.buffer;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.worksheets[0];
    const totalRows = worksheet.rowCount;

    // Get headers
    const headerRow = worksheet.getRow(1);
    const headers = headerRow.values.slice(1); // Skip first empty cell

    // Process rows in chunks
    const CHUNK_SIZE = 10000; // Process 10,000 rows at a time
    const results = { filtered: [], eliminated: [] };

    for (let i = 2; i <= totalRows; i += CHUNK_SIZE) {
      const chunkRows = [];
      const end = Math.min(i + CHUNK_SIZE - 1, totalRows);

      for (let j = i; j <= end; j++) {
        const row = worksheet.getRow(j);
        const rowData = {};
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          rowData[headers[colNumber - 1]] = cell.text || '';
        });
        chunkRows.push(rowData);
      }

      // Process chunk in a worker thread
      const worker = new Worker(path.join(__dirname, 'worker.js'), {
        workerData: { chunk: chunkRows },
      });

      const chunkResult = await new Promise((resolve, reject) => {
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
          if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
        });
      });

      // Merge results
      results.filtered.push(...chunkResult.filtered);
      results.eliminated.push(...chunkResult.eliminated);
    }

    res.json(results);
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Error processing file' });
  }
});

// Download filtered data as Excel
app.post('/api/download-excel', async (req, res) => {
  try {
    const { filteredData } = req.body;

    if (!Array.isArray(filteredData)) {
      return res.status(400).json({ error: 'Invalid filtered data' });
    }

    // Create a streaming workbook
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: res,
      useStyles: false,
      useSharedStrings: false,
    });

    const worksheet = workbook.addWorksheet('Filtered Data');

    // Add headers
    if (filteredData.length > 0) {
      const headers = Object.keys(filteredData[0]);
      worksheet.columns = headers.map((header) => ({
        header: header.toUpperCase(),
        key: header,
        width: 20,
      }));
    }

    // Stream rows to the workbook
    filteredData.forEach((row) => {
      worksheet.addRow(row).commit();
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="filtered_data.xlsx"');

    // Finalize the workbook
    worksheet.commit();
    workbook.commit().then(() => {
      res.end();
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Error generating Excel file' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));