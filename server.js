const express = require('express');
const XLSX = require('xlsx');
const fetch = require('node-fetch');
const path = require('path');

const app = express();

// Servir archivos estáticos
app.use(express.static(__dirname));

// Servir index.html en la raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API para obtener datos del Excel
app.get('/api/datos', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const SHAREPOINT_URL = 'https://adslhouse-my.sharepoint.com/:x:/p/efarfan/IQBroR6qt4SFRrLCmSkBrP7LARck3bLWXrxts0p9nsdTvPg?e=YI4r17&download=1';
    
    const response = await fetch(SHAREPOINT_URL);
    const buffer = await response.buffer();
    
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    
    res.json(jsonData);
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});
