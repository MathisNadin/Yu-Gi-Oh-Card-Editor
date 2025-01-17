/* eslint-disable no-console */
import path from 'path';
import { promises as fs } from 'fs';

// Fonction pour trouver tous les fichiers package.json dans le dossier source/libraries
async function findPackageJsonFiles(dir) {
  let results = [];
  const list = await fs.readdir(dir, { withFileTypes: true });
  for (const file of list) {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      results = results.concat(await findPackageJsonFiles(filePath));
    } else if (file.isFile() && file.name === 'package.json') {
      results.push(filePath);
    }
  }
  return results;
}

// Fonction pour charger les dépendances des fichiers package.json trouvés
async function loadDependencies(files) {
  const dependencies = {};
  const devDependencies = {};
  const conflicts = [];

  for (const file of files) {
    const content = JSON.parse(await fs.readFile(file, 'utf8'));
    ['dependencies', 'devDependencies'].forEach((depType) => {
      if (content[depType]) {
        for (const [pkg, version] of Object.entries(content[depType])) {
          const depCollection = depType === 'dependencies' ? dependencies : devDependencies;
          if (depCollection[pkg] && depCollection[pkg] !== version) {
            conflicts.push(`Conflit pour ${pkg}: ${depCollection[pkg]} vs ${version} dans ${file}`);
          } else {
            depCollection[pkg] = version;
          }
        }
      }
    });
  }

  return { dependencies, devDependencies, conflicts };
}

// Fonction pour trier un objet par ses clés
function sortObjectByKeys(obj) {
  return Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      result[key] = obj[key];
      return result;
    }, {});
}

// Fonction pour synchroniser les dépendances avec le package.json racine
async function syncRootPackageJson(dependencies, devDependencies) {
  const rootPackagePath = path.resolve(process.cwd(), 'package.json');
  const rootPackageContent = JSON.parse(await fs.readFile(rootPackagePath, 'utf8'));

  const modifications = [];

  ['dependencies', 'devDependencies'].forEach((depType) => {
    const depCollection = depType === 'dependencies' ? dependencies : devDependencies;
    if (!rootPackageContent[depType]) {
      rootPackageContent[depType] = {};
    }
    for (const [pkg, version] of Object.entries(depCollection)) {
      if (rootPackageContent[depType][pkg] !== version) {
        const action = rootPackageContent[depType][pkg] ? 'Mise à jour' : 'Ajout';
        modifications.push(`${action} de ${pkg} (${version}) dans ${depType}`);
        rootPackageContent[depType][pkg] = version;
      }
    }
    // Trier les dépendances par ordre alphabétique
    rootPackageContent[depType] = sortObjectByKeys(rootPackageContent[depType]);
  });

  await fs.writeFile(rootPackagePath, JSON.stringify(rootPackageContent, null, 2), 'utf8');
  return modifications;
}

// Fonction principale
(async () => {
  const sourceLibrariesPath = path.join(process.cwd(), 'source', 'libraries');
  const [webpackPackageJsonFile] = await findPackageJsonFiles(sourceLibrariesPath);
  const libsPackageJsonFiles = await findPackageJsonFiles(sourceLibrariesPath);
  const packageJsonFiles = [webpackPackageJsonFile, ...libsPackageJsonFiles];

  const { dependencies, devDependencies, conflicts } = await loadDependencies(packageJsonFiles);

  if (conflicts.length > 0) {
    console.log('Des conflits de versions ont été détectés :');
    conflicts.forEach((conflict) => console.log(conflict));
  } else {
    console.log('Aucun conflit de versions détecté.');
  }

  const modifications = await syncRootPackageJson(dependencies, devDependencies);

  if (modifications.length > 0) {
    console.log('\nModifications apportées au package.json racine :');
    modifications.forEach((mod) => console.log(mod));
  } else {
    console.log('\nAucune modification nécessaire sur le package.json racine.');
  }
})();
