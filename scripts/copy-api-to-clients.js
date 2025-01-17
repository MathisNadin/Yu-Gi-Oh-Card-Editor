/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

// Chemin vers le package.json
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = require(packageJsonPath);
const { name, clientProjects } = packageJson;

// Vérifier si clientProjects est défini et non vide
if (!clientProjects || clientProjects.length === 0) {
  console.log('Aucun projet client défini. Le script est terminé.');
  process.exit();
}

// Fonction pour copier les fichiers vers les dossiers clients
function copyFilesToClients() {
  const apiConfigFilePath = path.join(__dirname, `../config/${name}.ts`);
  const routerConfigFilePath = path.join(__dirname, `../config/${name.replace('--api', '--router')}.json`);

  clientProjects.forEach((clientProject) => {
    const destTsPath = path.join(__dirname, `../../${clientProject}/source/api/main.ts`);
    const destJsonPath = path.join(__dirname, `../../${clientProject}/source/api/main.json`);

    // Ajouter les lignes spécifiques au début du fichier main.ts
    const tsFileContent = `/* eslint-disable import/export */\n\n${fs.readFileSync(apiConfigFilePath, 'utf-8')}`;

    // Écriture du fichier .ts avec les lignes supplémentaires
    fs.writeFileSync(destTsPath, tsFileContent);
    console.log(`Copié ${apiConfigFilePath} vers ${destTsPath} avec les commentaires ajoutés.`);

    // Copie du fichier .json
    fs.copyFileSync(routerConfigFilePath, destJsonPath);
    console.log(`Copié ${routerConfigFilePath} vers ${destJsonPath}`);
  });
}

// Exécution initiale pour copier les fichiers
copyFilesToClients();

// Surveillance des fichiers pour les recopier lorsqu'ils sont modifiés
const tsWatcher = chokidar.watch(path.join(__dirname, `../config/${name}.ts`), { ignoreInitial: true });
tsWatcher.on('change', copyFilesToClients);

const jsonWatcher = chokidar.watch(path.join(__dirname, `../config/${name.replace('--api', '--router')}.json`), {
  ignoreInitial: true,
});
jsonWatcher.on('change', copyFilesToClients);

console.log('Surveillance des fichiers de configuration pour les projets clients activée.');
