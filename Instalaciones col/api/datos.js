const XLSX = require('xlsx');

// URL del archivo Excel en SharePoint
const SHAREPOINT_URL = 'https://adslhouse-my.sharepoint.com/:x:/p/efarfan/IQBroR6qt4SFRrLCmSkBrP7LARck3bLWXrxts0p9nsdTvPg?e=YI4r17&download=1';

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('📥 Descargando Excel desde SharePoint...');
    
    const response = await fetch(SHAREPOINT_URL, {
      method: 'GET',
      timeout: 30000,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Convertir response a buffer
    const buffer = await response.buffer();
    console.log(`📦 Buffer recibido: ${buffer.length} bytes`);

    // Parsear Excel con XLSX
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    console.log(`📊 Hojas encontradas: ${workbook.SheetNames.join(', ')}`);

    // Obtener la primera hoja
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convertir a JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`✓ Excel convertido a JSON: ${jsonData.length} registros`);
    console.log(`📋 Columnas: ${Object.keys(jsonData[0] || {}).join(', ')}`);

    return res.status(200).json(jsonData);

  } catch(error) {
    console.error('❌ Error:', error.message);
    
    return res.status(500).json({ 
      error: error.message,
      hint: 'Verifica que el Excel está accesible y es un formato válido'
    });
  }
};
