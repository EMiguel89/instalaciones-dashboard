const XLSX = require('xlsx');

// URL del archivo Excel en SharePoint (actualizada)
const SHAREPOINT_URL = 'https://adslhouse-my.sharepoint.com/:x:/p/efarfan/IQBroR6qt4SFRrLCmSkBrP7LARck3bLWXrxts0p9nsdTvPg?e=YI4r17&download=1';

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(jsonData),
    };

  } catch(error) {
    console.error('❌ Error:', error.message);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        hint: 'Verifica que el Excel está accesible y es un formato válido'
      }),
    };
  }
};