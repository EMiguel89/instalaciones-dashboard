const JSON_URL = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://adslhouse-my.sharepoint.com/:u:/p/efarfan/IQCusPJ4g4fFT7AzRybfEWxjAYq7evjYBdvMbX_ZTavfd2g?e=pdqRKK&download=1');

const CAMPANIAS = [
  { label: 'DIGITAL VECTOR BOG', valores: ['DIGITAL VECTOR BOG', 'WHATSAPP'] },
  { label: 'OUTBOUND HOGAR',     valores: ['OUTBOUND HOGAR'] },
  { label: 'WCB HOGAR',          valores: ['WCB HOGAR'] },
  { label: 'WHATSAPPEA',         valores: ['WHATSAPPEA'] },
];

const SUPABASE_URL = 'https://edcnjdupwvjxutlaemdy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkY25qZHVwd3ZqeHV0bGFlbWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MTYxNjAsImV4cCI6MjA5MTM5MjE2MH0.ZDt-qdWyMGrWHrElnG_wmA9_pnMKmsqBN_kLRd2vlnk';
const VALS_INSTALADO    = ['Instalada', 'INSTALADA', 'INSTALADO'];
const VALS_NO_INSTALADO = ['Cancelada', 'CANCELADA', 'Cancelado', 'CANCELADO'];

let DATA = [];
let campañaActiva = null;
let chartBarras = null;

function pct(num, den) {
  if (!den) return '0%';
  return Math.round((num / den) * 100) + '%';
}

function filasActivas() {
  if (campañaActiva === null) return DATA;
  const valoresFiltro = CAMPANIAS[campañaActiva].valores;
  return DATA.filter(d =>
    valoresFiltro.includes(String(d['Campaña']).trim())
  );
}

function renderTabs() {
  const cont = document.getElementById('campanias');
  cont.innerHTML = `
    <button class="tab-btn ${campañaActiva === null ? 'activo' : ''}" data-idx="">
      TODOS
    </button>
    ${CAMPANIAS.map((c, i) => `
      <button class="tab-btn ${campañaActiva === i ? 'activo' : ''}" data-idx="${i}">
        ${c.label}
      </button>
    `).join('')}
  `;

  cont.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.dataset.idx;
      campañaActiva = idx === '' ? null : Number(idx);
      renderTabs();
      renderDashboard();
    });
  });
}

function renderDashboard() {
  const filas = filasActivas();

  renderRanking(filas);
  renderTerreno(filas);
  renderRegional(filas);
  renderEstadoWFM(filas);
  renderInstaladosDia(filas);
}

function renderRanking(filas) {
  const porAsesor = {};
  filas.forEach(d => {
    const nombre = d['Asesor'] || d['Ficha'] || 'Sin nombre';
    if (!porAsesor[nombre]) porAsesor[nombre] = { total: 0, instalado: 0, noInstalado: 0 };
    porAsesor[nombre].total      += Number(d['Total Principales']) || 0;
    porAsesor[nombre].instalado  += VALS_INSTALADO.includes(String(d['Gestion Back']).trim()) ? 1 : 0;
    porAsesor[nombre].noInstalado+= VALS_NO_INSTALADO.includes(String(d['Gestion Back']).trim()) ? 1 : 0;
  });

  const filas_asesor = Object.entries(porAsesor)
    .sort((a, b) => b[1].total - a[1].total);

  const totalGeneral   = filas_asesor.reduce((s, [, v]) => s + v.total, 0);
  const instGeneral    = filas_asesor.reduce((s, [, v]) => s + v.instalado, 0);
  const noInstGeneral  = filas_asesor.reduce((s, [, v]) => s + v.noInstalado, 0);

  const filasTR = filas_asesor.map(([nombre, v]) => `
    <tr>
      <td>${nombre}</td>
      <td class="num">${v.total}</td>
      <td class="num">${v.instalado}</td>
      <td class="num">${pct(v.instalado, v.total)}</td>
      <td class="num">${v.noInstalado}</td>
      <td class="num">${pct(v.noInstalado, v.total)}</td>
    </tr>
  `).join('');

  document.getElementById('tabla-ranking').innerHTML = `
    ${filasTR}
    <tr>
      <td>Total</td>
      <td class="num">${totalGeneral}</td>
      <td class="num">${instGeneral}</td>
      <td class="num">${pct(instGeneral, totalGeneral)}</td>
      <td class="num">${noInstGeneral}</td>
      <td class="num">${pct(noInstGeneral, totalGeneral)}</td>
    </tr>
  `;
}

//Reporte terreno (Franja + Estado WFM)
function renderTerreno(filas) {
  const porFranja = {};
  filas.forEach(d => {
    const franja  = d['Franja'] || 'Sin franja';
    const gestion = d['Estado WFM'] || 'Sin gestión';
    if (!porFranja[franja]) porFranja[franja] = { accesos: 0, principales: 0, sub: {} };
    porFranja[franja].accesos     += d['Accesos'] && String(d['Accesos']).trim() !== '' ? 1 : 0;
    porFranja[franja].principales += Number(d['Total Principales']) || 0;
    if (!porFranja[franja].sub[gestion]) porFranja[franja].sub[gestion] = { accesos: 0, principales: 0 };
    porFranja[franja].sub[gestion].accesos     += d['Accesos'] && String(d['Accesos']).trim() !== '' ? 1 : 0;
    porFranja[franja].sub[gestion].principales += Number(d['Total Principales']) || 0;
  });

  let filasTR = '';
  let totAcc = 0, totPrinc = 0;
  Object.entries(porFranja).forEach(([franja, v]) => {
    totAcc   += v.accesos;
    totPrinc += v.principales;
    filasTR  += `<tr><td><strong>${franja}</strong></td><td class="num"><strong>${v.accesos}</strong></td><td class="num"><strong>${v.principales}</strong></td></tr>`;
    Object.entries(v.sub).forEach(([gest, sv]) => {
      filasTR += `<tr><td style="padding-left:20px">${gest}</td><td class="num">${sv.accesos}</td><td class="num">${sv.principales}</td></tr>`;
    });
  });
  filasTR += `<tr><td>Total</td><td class="num">${totAcc}</td><td class="num">${totPrinc}</td></tr>`;
  document.getElementById('tabla-terreno').innerHTML = filasTR;

  // Datos para el gráfico agrupados por Estado WFM
  const gestGrupos = {};
  filas.forEach(d => {
    const g = d['Estado WFM'] || 'Sin gestión';
    if (!gestGrupos[g]) gestGrupos[g] = { accesos: 0, principales: 0 };
    gestGrupos[g].accesos     += d['Accesos'] && String(d['Accesos']).trim() !== '' ? 1 : 0;
    gestGrupos[g].principales += Number(d['Total Principales']) || 0;
  });

  const gLabels  = Object.keys(gestGrupos);
  const gAcc     = gLabels.map(l => gestGrupos[l].accesos);
  const gPrinc   = gLabels.map(l => gestGrupos[l].principales);
  const totalAcc   = gAcc.reduce((s, v) => s + v, 0);
  const totalPrinc = gPrinc.reduce((s, v) => s + v, 0);

  if (chartBarras) chartBarras.destroy();
  chartBarras = new Chart(document.getElementById('chartTerreno'), {
    type: 'bar',
    data: {
      labels: gLabels,
      datasets: [
        { label: 'Accesos',           data: gAcc,   backgroundColor: '#1a3a6b', borderRadius: 3 },
        { label: 'Total Principales', data: gPrinc, backgroundColor: '#4a90d9', borderRadius: 3 },
      ]
    },
    options: {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: { top: 20 } // ← espacio arriba para los %
  },
  plugins: {
    legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12 } },
  },
  scales: {
    x: { ticks: { font: { size: 10 } } },
    y: {
      ticks: { stepSize: 1 },
      grace: '15%' // ← extiende el eje Y un 15% más arriba del valor máximo
    }
  },
  animation: {
    onComplete: function() {
      const chart = this;
      const ctx   = chart.ctx;
      ctx.font    = 'bold 10px Arial';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'bottom';

      chart.data.datasets.forEach((dataset, i) => {
        const total = i === 0 ? totalAcc : totalPrinc;
        const meta  = chart.getDatasetMeta(i);
        meta.data.forEach((bar, j) => {
          const valor  = dataset.data[j];
          const pctStr = total > 0 ? Math.round((valor / total) * 100) + '%' : '0%';
          ctx.fillStyle = '#333';
          ctx.fillText(pctStr, bar.x, bar.y - 3);
        });
      });
    }
  }
}
  });
}

function renderRegional(filas) {
  const porRegional = {};
  filas.forEach(d => {
    const r = d['REGIONAL'] || 'Sin regional';
    if (!porRegional[r]) porRegional[r] = { accesos: 0, principales: 0 };
    porRegional[r].accesos     += d['Accesos'] && String(d['Accesos']).trim() !== '' ? 1 : 0;
    porRegional[r].principales += Number(d['Total Principales']) || 0;
  });

  const entries = Object.entries(porRegional).sort((a, b) => b[1].principales - a[1].principales);
  const totAcc   = entries.reduce((s, [, v]) => s + v.accesos, 0);
  const totPrinc = entries.reduce((s, [, v]) => s + v.principales, 0);

  document.getElementById('tabla-regional').innerHTML = `
    ${entries.map(([r, v]) => `
      <tr>
        <td>${r}</td>
        <td class="num">${v.accesos}</td>
        <td class="num">${v.principales}</td>
      </tr>
    `).join('')}
    <tr>
      <td>Total</td>
      <td class="num">${totAcc}</td>
      <td class="num">${totPrinc}</td>
    </tr>
  `;
}

//Tabla Gestión Back
function renderEstadoWFM(filas) {
  const porGestion = {};
  filas.forEach(d => {
    const g = d['Gestion Back'] || 'Sin gestión';
    if (!porGestion[g]) porGestion[g] = { accesos: 0, principales: 0 };
    porGestion[g].accesos     += d['Accesos'] && String(d['Accesos']).trim() !== '' ? 1 : 0;
    porGestion[g].principales += Number(d['Total Principales']) || 0;
  });

  const entries  = Object.entries(porGestion);
  const totAcc   = entries.reduce((s, [, v]) => s + v.accesos, 0);
  const totPrinc = entries.reduce((s, [, v]) => s + v.principales, 0);

  document.getElementById('tabla-gestion').innerHTML = `
    ${entries.map(([g, v]) => `
      <tr>
        <td>${g}</td>
        <td class="num">${v.accesos}</td>
        <td class="num">${v.principales}</td>
      </tr>
    `).join('')}
    <tr>
      <td>Total</td>
      <td class="num">${totAcc}</td>
      <td class="num">${totPrinc}</td>
    </tr>
  `;
}

function renderInstaladosDia(filas) {
  const hoy = new Date();
  const dd   = String(hoy.getDate()).padStart(2, '0');
  const mm   = String(hoy.getMonth() + 1).padStart(2, '0');
  const yyyy = hoy.getFullYear();
  const hoyStr = `${dd}/${mm}/${yyyy}`;

  const filasHoy = filas.filter(d => {
    const fechaDigit = String(d['Fecha Digitacion'] || '').trim();
    const esInstalada = VALS_INSTALADO.includes(String(d['Gestion Back']).trim());
    return esInstalada && fechaDigit.startsWith(hoyStr.substring(0, 10));
  });

  const porAsesor = {};
  filasHoy.forEach(d => {
    const nombre = d['Asesor'] || d['Ficha'] || 'Sin nombre';
    if (!porAsesor[nombre]) porAsesor[nombre] = { accesos: 0, principales: 0 };
    porAsesor[nombre].accesos     += d['Accesos'] && String(d['Accesos']).trim() !== '' ? 1 : 0;
    porAsesor[nombre].principales += Number(d['Total Principales']) || 0;
  });

  const entries  = Object.entries(porAsesor).sort((a, b) => b[1].principales - a[1].principales);
  const totAcc   = entries.reduce((s, [, v]) => s + v.accesos, 0);
  const totPrinc = entries.reduce((s, [, v]) => s + v.principales, 0);

  document.getElementById('tabla-instalados-dia').innerHTML = entries.length
    ? `
      ${entries.map(([nombre, v]) => `
        <tr>
          <td>${nombre}</td>
          <td class="num">${v.accesos}</td>
          <td class="num">${v.principales}</td>
        </tr>
      `).join('')}
      <tr>
        <td>Total</td>
        <td class="num">${totAcc}</td>
        <td class="num">${totPrinc}</td>
      </tr>
    `
    : `<tr><td colspan="3" style="text-align:center;padding:1rem;color:#aaa">Sin instalaciones hoy</td></tr>`;
}

function renderRecuperacion(filas) {
  const porRecup = {};

  filas.forEach(d => {
    const estadoWFM  = String(d['Estado WFM'] || '').trim().toUpperCase();
    const recuperacion = String(d['RECUPERACION'] || '').trim();

    let clave;
    if (estadoWFM === 'NO INSTALADO' && recuperacion === '') {
      clave = 'NO RECUPERADO';
    } else if (recuperacion !== '') {
      clave = recuperacion;
    } else {
      return; // no cuenta si no aplica
    }

    if (!porRecup[clave]) porRecup[clave] = { accesos: 0, principales: 0 };
    porRecup[clave].accesos     += d['Accesos'] && String(d['Accesos']).trim() !== '' ? 1 : 0;
    porRecup[clave].principales += Number(d['Total Principales']) || 0;
  });

  const entries  = Object.entries(porRecup);
  const totAcc   = entries.reduce((s, [, v]) => s + v.accesos, 0);
  const totPrinc = entries.reduce((s, [, v]) => s + v.principales, 0);

  document.getElementById('tabla-recuperacion').innerHTML = entries.length
    ? `
      ${entries.map(([r, v]) => `
        <tr>
          <td>${r}</td>
          <td class="num">${v.accesos}</td>
          <td class="num">${v.principales}</td>
        </tr>
      `).join('')}
      <tr>
        <td>Total</td>
        <td class="num">${totAcc}</td>
        <td class="num">${totPrinc}</td>
      </tr>
    `
    : `<tr><td colspan="3" style="text-align:center;padding:1rem;color:#aaa">Sin datos</td></tr>`;
}

function construirUI() {
  document.getElementById('contenido').innerHTML = `

    <div style="display:grid;grid-template-columns:40% 60%;gap:10px">

      <!-- Columna izquierda: Ranking -->
      <div class="card">
        <div class="card-header">RANKING ASESORES</div>
        <div style="overflow:auto">
          <table>
            <thead>
              <tr>
                <th>Asesor</th>
                <th class="num">Total Principales</th>
                <th class="num">Instalado</th>
                <th class="num">% Instalación</th>
                <th class="num">No Instalado</th>
                <th class="num">% Caída</th>
              </tr>
            </thead>
            <tbody id="tabla-ranking"></tbody>
          </table>
        </div>
      </div>

      <!-- Columna derecha -->
      <div style="display:flex;flex-direction:column;gap:10px">

        <!-- Terreno + Gráfico -->
        <div class="card">
          <div class="card-header">REPORTE GENERAL EN TERRENO</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0">
            <div style="overflow:auto;border-right:1px solid #eee">
              <table>
                <thead>
                  <tr>
                    <th>Franja / Gestión</th>
                    <th class="num">Accesos</th>
                    <th class="num">Principales</th>
                  </tr>
                </thead>
                <tbody id="tabla-terreno"></tbody>
              </table>
            </div>
            <div style="padding:1rem;display:flex;align-items:center">
              <div style="position:relative;width:100%;height:200px">
                <canvas id="chartTerreno"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Fila inferior derecha -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;align-items:start">

          <!-- Regional arriba + Recuperación abajo -->
          <div style="display:flex;flex-direction:column;gap:10px">

            <div class="card">
              <div class="card-header">REGIONAL</div>
              <div style="overflow:auto">
                <table>
                  <thead>
                    <tr>
                      <th>Regional</th>
                      <th class="num">Accesos</th>
                      <th class="num">Principales</th>
                    </tr>
                  </thead>
                  <tbody id="tabla-regional"></tbody>
                </table>
              </div>
            </div>

            <div class="card">
              <div class="card-header">RECUPERACIÓN</div>
              <div style="overflow:auto">
                <table>
                  <thead>
                    <tr>
                      <th>Recuperación</th>
                      <th class="num">Accesos</th>
                      <th class="num">Principales</th>
                    </tr>
                  </thead>
                  <tbody id="tabla-recuperacion"></tbody>
                </table>
              </div>
            </div>

          </div>

          <!-- Gestión Back -->
          <div class="card" style="width:120%">
            <div class="card-header">GESTIÓN BACK</div>
            <div style="overflow:auto">
              <table>
                <thead>
                  <tr>
                    <th>Gestión Back</th>
                    <th class="num">Accesos</th>
                    <th class="num">Principales</th>
                  </tr>
                </thead>
                <tbody id="tabla-gestion"></tbody>
              </table>
            </div>
          </div>

          <!-- Instalados hoy -->
          <div class="card2" style="width:70%;margin-left:20%">
            <div class="card-header">DIGITADO / INSTALADO HOY MISMO</div>
            <div style="overflow:auto">
              <table>
                <thead>
                  <tr>
                    <td class="num">Accesos</td>
                    <td class="num">Principales</td>
                  </tr>
                </thead>
                <tbody id="tabla-instalados-dia"></tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  `;
}

// URL de SharePoint - ahora es un archivo Excel (.xlsx)
const SHAREPOINT_URL = 'https://adslhouse-my.sharepoint.com/:x:/p/efarfan/IQBroR6qt4SFRrLCmSkBrP7LARck3bLWXrxts0p9nsdTvPg?e=YI4r17&download=1';

// Múltiples proxies CORS en orden de preferencia
const CORS_PROXIES = [
  url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  url => `https://thingproxy.freeboard.io/fetch/${url}`,
  url => `https://cors-anywhere.herokuapp.com/${url}`,
];

// Obtener datos de SharePoint con retry automático
async function obtenerDatos() {
  // Opción 1: Intentar con la función serverless (Vercel/Netlify)
  try {
    console.log('Opción 1: Intentando función serverless...');
    const res = await fetch('/api/datos', { 
      method: 'GET',
      timeout: 10000 
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log('✓ Datos obtenidos desde función serverless');
      return data;
    }
  } catch(e) {
    console.log('Opción 1 falló, probando proxies CORS...');
  }

  // Opción 2: Intentar cada proxy CORS hasta que uno funcione
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    try {
      const proxyFn = CORS_PROXIES[i];
      const proxyUrl = proxyFn(SHAREPOINT_URL);
      
      console.log(`Opción 2.${i + 1}: Intentando proxy...`);
      
      const res = await fetch(proxyUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        timeout: 10000
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`✓ Datos obtenidos desde proxy ${i + 1}`);
        // Loguear info del proxy que funcionó
        const rawText = JSON.stringify(data);
        console.log(`📊 Tamaño descargado: ${(rawText.length / 1024).toFixed(2)} KB`);
        return data;
      } else {
        console.warn(`Proxy ${i + 1}: HTTP ${res.status}`);
      }
    } catch(e) {
      console.warn(`Proxy ${i + 1} falló:`, e.message);
    }
  }

  throw new Error('No se pudo conectar a SharePoint con ningún método disponible');
}

// Renderizar función principal
function render() {
  renderTabs();
  renderDashboard();
}

// Carga de datos principal
async function cargarDatos() {
  try {
    console.log('🔄 Cargando datos desde SharePoint...');
    const data = await obtenerDatos();

    // Loguear datos crudos para validación
    console.log('📋 Datos crudos descargados:', data);
    console.log('📊 Tipo de dato:', typeof data);
    console.log('📦 Es array:', Array.isArray(data));

    // Procesar datos
    if (Array.isArray(data)) {
      DATA = data;
    } else if (data.data && Array.isArray(data.data)) {
      DATA = data.data;
    } else if (typeof data === 'object' && Object.keys(data).length > 0) {
      // Buscar el primer array en el objeto
      for (const key in data) {
        if (Array.isArray(data[key]) && data[key].length > 0) {
          console.log(`✓ Array encontrado en propiedad "${key}"`);
          DATA = data[key];
          break;
        }
      }
    }

    if (!Array.isArray(DATA) || DATA.length === 0) {
      throw new Error('El archivo de SharePoint no contiene datos válidos');
    }

    // Detalles del contenido descargado
    console.log(`✓ ${DATA.length} registros cargados`);
    console.log('📌 Primeros registros:', DATA.slice(0, 3));
    console.log('🔍 Columnas encontradas:', Object.keys(DATA[0] || {}));
    console.log('✅ Datos validados correctamente');
    
    // Mostrar en consola para verificación manual
    console.table(DATA);
    
    construirUI();
    render();

  } catch(e) {
    console.error('❌ Error:', e.message);
    document.getElementById('contenido').innerHTML = `
      <div class="estado error">
        <h3>❌ Error cargando datos</h3>
        <p>${e.message}</p>
        <hr>
        <p style="font-size:12px;color:#666">
          <strong>Para validar los datos descargados:</strong><br>
          1. Abre la consola (F12)<br>
          2. En la consola, escribe: <code>DATA</code><br>
          3. Verifica el tamaño y contenido completo<br>
          4. Si ves solo 1-2 registros, descarga manualmente el JSON del SharePoint
        </p>
      </div>
    `;
  }
}

// Cargar datos cuando el documento esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', cargarDatos);
} else {
  cargarDatos();
}