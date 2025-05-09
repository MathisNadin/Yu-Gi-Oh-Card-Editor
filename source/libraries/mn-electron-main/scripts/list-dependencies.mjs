/* eslint-disable no-console */
import { globSync } from 'glob';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Obtenir le chemin du fichier actuel
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const libraryPath = join(__dirname, '..', 'library');

const files = globSync(`${libraryPath}/**/*.ts`);

if (!files) {
  console.error('Erreur lors de la lecture des fichiers');
  process.exit(1);
}

const dependencies = new Set();

files.forEach((file) => {
  const content = readFileSync(file, 'utf8');

  const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
  const importRegex = /import.*from ['"]([^'"]+)['"]/g;

  let match;

  while ((match = requireRegex.exec(content)) !== null) {
    const dep = match[1];
    if (dep && !dep.startsWith('.')) {
      dependencies.add(dep);
    }
  }

  while ((match = importRegex.exec(content)) !== null) {
    const dep = match[1];
    if (dep && !dep.startsWith('.')) {
      dependencies.add(dep);
    }
  }
});

console.log('Dépendances trouvées :');
dependencies.forEach((dep) => console.log(dep));
