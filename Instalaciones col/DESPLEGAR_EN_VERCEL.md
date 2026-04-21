# 🚀 Desplegar en Vercel

## Paso 1: Preparar tu proyecto

Tu proyecto ya está listo. Los archivos importantes son:
- `app.js` - Dashboard principal
- `index.html` - Página HTML
- `styles.css` - Estilos
- `api/datos.js` - Función serverless que descarga del Excel
- `package.json` - Dependencias

## Paso 2: Subir a Vercel

### Opción A: Drag & Drop (Más fácil)
1. Ve a https://vercel.com/
2. Si no tienes cuenta, regístrate (es gratis)
3. En el dashboard, busca "Import Project" o simplemente arrastra toda tu carpeta al área indicada
4. Espera a que Vercel termine de desplegar (~2 minutos)

### Opción B: Desde GitHub (Recomendado para updates)
1. Sube tu carpeta a GitHub (https://github.com/new)
2. Ve a https://vercel.com
3. Click en "Import Project"
4. Pega la URL de tu repositorio de GitHub
5. Click "Import" y listo!

## Paso 3: Verificar que funciona

1. Una vez desplegado, Vercel te da una URL (ej: `https://instalaciones-col.vercel.app`)
2. Abre esa URL en tu navegador
3. Abre la consola (F12) y verifica que:
   - Los datos se cargan
   - El dashboard se llena con información
   - No hay errores rojos

## Si algo falla:

- Verifica en la consola (F12) qué error muestra
- Si la API no responde, puede ser que el Excel del SharePoint esté bloqueado
- En ese caso, pueden hacer el Excel público (compartido con "Cualquiera") o usar un proxy CORS

## ¿Qué URL usar en el dashboard?

El dashboard usará automáticamente `/api/datos` que apunta a tu función serverless en Vercel.

¡Listo! 🎉
