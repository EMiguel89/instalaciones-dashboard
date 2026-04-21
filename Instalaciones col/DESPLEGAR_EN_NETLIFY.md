# 🚀 INSTRUCCIONES PARA DESPLEGAR EN NETLIFY

## OPCIÓN 1: Deploy Automático desde el Navegador (Más Fácil)

1. **Sube tu proyecto a GitHub**
   - Crea una cuenta en github.com (si no tienes)
   - Crea un nuevo repositorio
   - Sube estos archivos:
     - app.js
     - index.html
     - styles.css
     - netlify/functions/datos.js
     - netlify.toml
     - package.json

2. **Conecta a Netlify**
   - Ve a https://netlify.com
   - Click en "Sign up" (con GitHub)
   - Autoriza Netlify
   - Click en "Import an existing project"
   - Selecciona tu repositorio
   - Click "Deploy"

## OPCIÓN 2: Deploy Manual

Si PowerShell tiene problemas, descarga una terminal alternativa:
- **Git Bash** (viene con Git)
- **Windows Terminal** (Microsoft Store)
- **Cmder** (cmder.net)

Luego en cualquiera de esas:
```bash
npm install -g netlify-cli
cd "tu carpeta del proyecto"
netlify init
netlify deploy --prod
```

## OPCIÓN 3: Drag & Drop

1. Ve a https://netlify.com
2. Sign up (si no tienes cuenta)
3. Arrastra tu carpeta del proyecto al area que dice "Drag and drop your site output folder here"

---

✅ Tu proyecto ya está configurado para Netlify:
- ✓ netlify.toml - Configuración
- ✓ package.json - Dependencias
- ✓ netlify/functions/datos.js - Función serverless

¡Elige cualquiera de las 3 opciones arriba!
