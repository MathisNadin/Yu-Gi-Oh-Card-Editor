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
  const versionConflicts = [];
  const placementConflicts = [];

  // Pour suivre où apparaît chaque package (dep/dev + fichier)
  const allPackages = {};

  for (const file of files) {
    const content = JSON.parse(await fs.readFile(file, 'utf8'));

    const depTypes = ['dependencies', 'devDependencies'];

    depTypes.forEach((depType) => {
      const deps = content[depType];
      if (!deps) return;

      Object.entries(deps).forEach(([pkg, version]) => {
        // Suivi global pour placement deps/dev
        if (!allPackages[pkg]) {
          allPackages[pkg] = [];
        }
        allPackages[pkg].push({ file, depType, version });

        // Logique existante : conflit de version au sein du même depType
        const depCollection = depType === 'dependencies' ? dependencies : devDependencies;
        if (depCollection[pkg] && depCollection[pkg] !== version) {
          versionConflicts.push(
            `Conflit de version pour ${pkg} (${depType}) : ${depCollection[pkg]} vs ${version} dans ${file}`
          );
        } else {
          depCollection[pkg] = version;
        }
      });
    });
  }

  for (const [pkg, locations] of Object.entries(allPackages)) {
    const depTypes = new Set(locations.map((l) => l.depType));
    if (depTypes.size > 1) {
      const detail = locations.map((l) => `${l.depType} (${l.version}) dans ${l.file}`).join(' ; ');
      placementConflicts.push(`Package ${pkg} utilisé à la fois en dependencies et devDependencies : ${detail}`);
    }
  }

  return { dependencies, devDependencies, versionConflicts, placementConflicts };
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

// Vérification des overrides du package.json racine
function checkOverrides(rootPackageContent, dependencies, devDependencies) {
  const overrides = rootPackageContent.overrides;
  if (!overrides) return [];

  const messages = [];

  for (const [pkg, overrideValue] of Object.entries(overrides)) {
    // Deux cas : string direct ou objet (pour des sous-dépendances)
    if (typeof overrideValue === 'string') {
      const aggVersion = dependencies[pkg] ?? devDependencies[pkg];
      if (!aggVersion) {
        messages.push(
          `Override pour ${pkg} (${overrideValue}) mais ce package n'apparaît pas dans les deps agrégées des sous-librairies.`
        );
      } else if (aggVersion !== overrideValue) {
        messages.push(`Override pour ${pkg}: ${overrideValue}, mais version agrégée trouvée: ${aggVersion}`);
      }
    } else if (overrideValue && typeof overrideValue === 'object') {
      // Exemple: "firebase-admin": { "whatwg-url": "^15.0.0" }
      messages.push(
        `Override complexe pour ${pkg} (objet). Vérification manuelle recommandée : ${JSON.stringify(overrideValue)}`
      );
    }
  }

  return messages;
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

  // Vérifier les overrides après mise à jour des deps
  const overrideMessages = checkOverrides(rootPackageContent, dependencies, devDependencies);

  await fs.writeFile(rootPackagePath, JSON.stringify(rootPackageContent, null, 2), 'utf8');
  return { modifications, overrideMessages };
}

// Fonction principale
(async () => {
  const webpackPath = path.join(process.cwd(), 'webpack');
  const [webpackPackageJsonFile] = await findPackageJsonFiles(webpackPath);

  const sourceLibrariesPath = path.join(process.cwd(), 'source', 'libraries');
  const libsPackageJsonFiles = await findPackageJsonFiles(sourceLibrariesPath);

  const packageJsonFiles = [webpackPackageJsonFile, ...libsPackageJsonFiles];

  const { dependencies, devDependencies, versionConflicts, placementConflicts } =
    await loadDependencies(packageJsonFiles);

  if (versionConflicts.length > 0) {
    console.log('Des conflits de versions ont été détectés :');
    versionConflicts.forEach((conflict) => console.log(conflict));
  } else {
    console.log('Aucun conflit de versions détecté.');
  }

  if (placementConflicts.length > 0) {
    console.log('\nDes différences de placement (dependencies vs devDependencies) ont été détectées :');
    placementConflicts.forEach((c) => console.log(c));
  } else {
    console.log('\nAucune différence de placement dependencies/devDependencies détectée.');
  }

  const { modifications, overrideMessages } = await syncRootPackageJson(dependencies, devDependencies);

  if (modifications.length > 0) {
    console.log('\nModifications apportées au package.json racine :');
    modifications.forEach((mod) => console.log(mod));
  } else {
    console.log('\nAucune modification nécessaire sur le package.json racine.');
  }

  if (overrideMessages.length > 0) {
    console.log('\nAnalyse des overrides du package.json racine :');
    overrideMessages.forEach((msg) => console.log(msg));
  } else {
    console.log('\nAucun problème détecté sur les overrides du package.json racine.');
  }
})().catch((err) => {
  console.error('Erreur lors de l’exécution du script :', err);
  process.exit(1);
});
