const express = require('express');
const XLSX = require('xlsx');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');

const app = express();

// Obtener directorio raíz correctamente
const rootDir = process.cwd();
console.log('Root directory:', rootDir);

// Servir archivos estáticos
app.use(express.static(rootDir));

// Servir index.html en la raíz
app.get('/', (req, res) => {
  const indexPath = path.join(rootDir, 'index.html');
  console.log('Buscando index.html en:', indexPath);
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('index.html no encontrado');
  }
});

// API para obtener datos del Excel
app.get('/api/datos', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const SHAREPOINT_URL = 'https://adslhouse-my.sharepoint.com/:u:/p/efarfan/IQCusPJ4g4fFT7AzRybfEWxjAYq7evjYBdvMbX_ZTavfd2g?e=QU0lFD&download=1';
    
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
