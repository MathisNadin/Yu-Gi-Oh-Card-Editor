/* eslint-disable no-console */
import fs from 'fs/promises';
import path from 'path';

// Comme on suppose qu'on exécute ce script depuis le dossier webpack,
// process.cwd() = /mon-projet/webpack
// Donc le dossier racine est un cran au-dessus.
const rootDir = path.resolve(process.cwd(), '..');

// 1) Dossier source (là où se trouvent les scripts à recopier).
//    Adaptez ici pour `app-scripts` ou tout autre dossier dans /webpack.
const sourceScriptsDir = path.join(process.cwd(), 'app-scripts');

// 2) Dossier cible (celui qu’on veut créer s’il n’existe pas).
const targetScriptsDir = path.join(rootDir, 'script');

// 3) Chemin du package.json racine et du package.json Webpack.
const rootPackageJsonPath = path.join(rootDir, 'package.json');
const webpackPackageJsonPath = path.join(process.cwd(), 'package.json');

async function main() {
  // --- Étape 1 : créer le dossier `script` à la racine, s'il n'existe pas. ---
  try {
    await fs.mkdir(targetScriptsDir, { recursive: true });
    console.log(`✅ Dossier 'script' créé ou déjà existant : ${targetScriptsDir}`);
  } catch (err) {
    console.error(`❌ Erreur lors de la création du dossier 'script':`, err);
    process.exit(1);
  }

  // --- Étape 2 : copier le contenu de webpack/app-scripts vers /script. ---
  // Utilise fs.cp (Node 16.7+). Pour les versions antérieures, utiliser fs-extra.
  try {
    await fs.cp(sourceScriptsDir, targetScriptsDir, {
      recursive: true,
      force: true, // force overwrite
    });
    console.log(`✅ Scripts copiés de '${sourceScriptsDir}' vers '${targetScriptsDir}'`);
  } catch (err) {
    console.error(`❌ Erreur lors de la copie des scripts :`, err);
    process.exit(1);
  }

  // --- Étape 3 : mettre à jour le package.json racine avec les appScripts. ---
  try {
    const rootPackageJsonRaw = await fs.readFile(rootPackageJsonPath, 'utf8');
    const webpackPackageJsonRaw = await fs.readFile(webpackPackageJsonPath, 'utf8');
    const rootPackageJson = JSON.parse(rootPackageJsonRaw);
    const webpackPackageJson = JSON.parse(webpackPackageJsonRaw);

    // On récupère l'objet "appScripts" défini dans webpack/package.json
    const { appScripts = {} } = webpackPackageJson;

    // On fusionne/écrase chaque clé de appScripts dans rootPackageJson.scripts
    rootPackageJson.scripts = rootPackageJson.scripts || {};
    for (const [scriptName, scriptCommand] of Object.entries(appScripts)) {
      rootPackageJson.scripts[scriptName] = scriptCommand;
    }

    // Écriture du nouveau package.json racine
    const newRootPackageJson = JSON.stringify(rootPackageJson, null, 2);
    await fs.writeFile(rootPackageJsonPath, newRootPackageJson, 'utf8');

    console.log(`✅ Mise à jour du package.json racine avec les appScripts :`);
    console.table(appScripts);
  } catch (err) {
    console.error(`❌ Erreur lors de la mise à jour du package.json racine :`, err);
    process.exit(1);
  }

  console.log('✅ Synchronisation terminée avec succès.');
}

main();
