const fs = require('fs');
const path = require('path');

// URL del backend local (donde corre CodesCam en Docker)
const API_URL = 'http://localhost:4000/api/projects';
const ANALIZADOR_DIR = path.join(__dirname, 'ANALIZADOR');

// Extensiones de código que CodesCam soporta hasta el momento
const IGNORED_EXTS = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.mp4', '.webm', '.ogg', '.mp3', '.wav', '.pdf', '.zip', '.tar', '.gz', '.rar', '.7z', '.exe', '.dll', '.bin', '.dat', '.class', '.jar', '.DS_Store'];

// Función recursiva para leer carpetas sin escanear carpetas inútiles
function getAnalyzableFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;

  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      // Ignorar carpetas comunes de compilación y control de versiones
      if (!['node_modules', '.git', 'dist', 'build', 'venv', '__pycache__', 'target'].includes(file)) {
        arrayOfFiles = getAnalyzableFiles(fullPath, arrayOfFiles);
      }
    } else {
      const ext = path.extname(fullPath).toLowerCase();
      const isGigante = fs.statSync(fullPath).size > 2 * 1024 * 1024; // 2MB limite para texto
      if (!IGNORED_EXTS.includes(ext) && !isGigante) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

async function analyzeWorkspace() {
  if (!fs.existsSync(ANALIZADOR_DIR)) {
    console.log('❌ La carpeta ANALIZADOR no existe. Creándola...');
    fs.mkdirSync(ANALIZADOR_DIR);
    console.log('✅ Carpeta ANALIZADOR creada en la raíz de CodesCam.');
    return;
  }

  const items = fs.readdirSync(ANALIZADOR_DIR);
  const projects = items.filter(f => fs.statSync(path.join(ANALIZADOR_DIR, f)).isDirectory());

  if (projects.length === 0) {
    console.warn('\n⚠️ No hay carpetas de proyectos dentro de "ANALIZADOR".');
    console.log('👉 Mete una carpeta con tu código ahí adentro y vuelve a ejecutar este script.\n');
    return;
  }

  for (const projectName of projects) {
    console.log(`\n🚀 Procesando nuevo proyecto: "${projectName}"`);
    const projectPath = path.join(ANALIZADOR_DIR, projectName);
    const files = getAnalyzableFiles(projectPath);

    if (files.length === 0) {
      console.log(`   ⏭️ Ignorado: No se encontraron archivos para analizar en "${projectName}"`);
      continue;
    }

    console.log(`🔍 Se encontraron ${files.length} archivos en "${projectName}". Analizando TODO el código fuente a fondo...`);

    try {
      // 1. Registrar o recuperar el proyecto en tu CodesCam local
      let projectId;
      try {
        const getRes = await fetch(API_URL);
        if (getRes.ok) {
          const projs = await getRes.json();
          const p = projs.find(e => e.name === projectName);
          if (p) projectId = p.id;
        }
      } catch (err) {}

      if (!projectId) {
        const createRes = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: projectName, language: 'auto' })
        });

        if (!createRes.ok) {
          console.error('❌ Error registrando el proyecto en backend.');
          continue;
        }
        const data = await createRes.json();
        projectId = data.id;
      }

      // 2. Enviar archivos al analizador de CodesCam uno por uno
      
      const payloadFiles = files.map(file => {
        return {
          filename: path.relative(projectPath, file),
          code: fs.readFileSync(file, 'utf8')
        }
      });
      
      const analyzeRes = await fetch(`${API_URL}/${projectId}/analyze-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: payloadFiles })
      });

      let procesados = analyzeRes.ok ? files.length : 0;


      console.log(`✅ Proyecto "${projectName}" terminado. (${procesados}/${files.length} analizados correctamente).`);
      console.log(`🎉 ¡Abre tu navegador en http://localhost:3000 para verlo en el Dashboard!`);

    } catch (error) {
      console.error(`❌ Fallo crítico al conectarse con CodesCam:`, error.message);
      console.log('💡 Asegúrate de que los contenedores Docker estén corriendo (localhost:4000).');
    }
  }
}

analyzeWorkspace();