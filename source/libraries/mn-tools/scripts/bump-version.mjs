/* eslint-disable no-console */
import { execSync } from 'child_process';
import { inc } from 'semver';
import { createInterface } from 'readline';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const args = process.argv.slice(2);

// Vérifier s'il faut faire un git pull
try {
  const status = execSync('git remote update && git status -uno').toString();
  if (status.includes('Your branch is behind')) {
    console.error("Vous devez d'abord effectuer un git pull.");
    process.exit(1);
  }
} catch (error) {
  console.error('Erreur lors de la vérification du statut Git :', error);
  process.exit(1);
}

// Obtenir la version actuelle
let currentVersion;
try {
  currentVersion = execSync('git describe --tags --abbrev=0').toString().trim();
} catch {
  currentVersion = '0.0.0'; // Version initiale si aucun tag n'existe
}

// Déterminer la prochaine version
let nextVersion;
if (args.includes('M')) {
  nextVersion = inc(currentVersion, 'major');
} else if (args.includes('m')) {
  nextVersion = inc(currentVersion, 'minor');
} else {
  nextVersion = inc(currentVersion, 'patch');
}

// Vérifier si le tag existe déjà en remote
try {
  const remoteTags = execSync(`git ls-remote --tags origin refs/tags/${nextVersion}`).toString().trim();
  if (remoteTags) {
    console.error(`Le tag ${nextVersion} existe déjà en remote.`);
    process.exit(1);
  }
} catch (error) {
  console.error('Erreur lors de la vérification des tags en remote :', error);
  process.exit(1);
}

// Vérifier si le tag existe déjà localement
try {
  const localTags = execSync(`git tag -l ${nextVersion}`).toString().trim();
  if (localTags) {
    console.error(`Le tag ${nextVersion} existe déjà localement.`);
    process.exit(1);
  }
} catch (error) {
  console.error('Erreur lors de la vérification des tags locaux :', error);
  process.exit(1);
}

// Fonction pour mettre à jour le changelog
const updateChangelog = (/** @type {string | null} */ version) => {
  try {
    execSync('npm run update-changelog', { stdio: 'inherit' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du changelog :', error);
    process.exit(1);
  }

  const changelogPath = join(process.cwd(), 'CHANGELOG.md');
  if (existsSync(changelogPath)) {
    let changelog = readFileSync(changelogPath, 'utf8');
    changelog = changelog.replace('## HEAD', `## ${version}`);
    writeFileSync(changelogPath, changelog, 'utf8');
    console.log(`Changelog mis à jour avec la version ${version}`);
  } else {
    console.error('Fichier CHANGELOG.md introuvable.');
    process.exit(1);
  }
};

// Fonction pour mettre à jour la version dans package.json et package-lock.json
const updatePackageJsonVersion = (/** @type {string | null} */ version) => {
  const packageJsonPath = join(process.cwd(), 'package.json');
  const packageLockPath = join(process.cwd(), 'package-lock.json');

  // Mise à jour du package.json
  if (existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    packageJson.version = version;
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
    console.log(`Version mise à jour dans package.json : ${version}`);
  } else {
    console.error('Fichier package.json introuvable.');
    process.exit(1);
  }

  // Mise à jour du package-lock.json, si existant
  if (existsSync(packageLockPath)) {
    const packageLock = JSON.parse(readFileSync(packageLockPath, 'utf8'));

    if (packageLock.version) {
      packageLock.version = version;
    }
    // Mettre à jour la version du package racine anonyme ""
    if (packageLock.packages && packageLock.packages['']) {
      packageLock.packages[''].version = version;
    }

    writeFileSync(packageLockPath, JSON.stringify(packageLock, null, 2), 'utf8');
    console.log(`Version mise à jour dans package-lock.json : ${version}`);
  }
};

// Fonction pour demander une confirmation utilisateur
const askUserConfirmation = async (/** @type {string} */ question) => {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
};

// Demander à l'utilisateur de confirmer la mise à jour de la version
(async () => {
  const userConfirmed = await askUserConfirmation(`Confirmez-vous le bump vers la version ${nextVersion} ? (y/N) : `);

  if (!userConfirmed) {
    console.log("Bump annulé par l'utilisateur.");
    process.exit(0);
  }

  // Mettre à jour la version dans package.json et package-lock.json
  updatePackageJsonVersion(nextVersion);

  // Mettre à jour le changelog avant de committer
  updateChangelog(nextVersion);

  // Effectuer git add . et git commit
  try {
    execSync('git add .');
    execSync(`git commit -am "bump to ${nextVersion}"`);
  } catch (error) {
    console.error('Erreur lors du commit :', error);
    process.exit(1);
  }

  // Pusher les changements
  try {
    execSync('git push');
  } catch (error) {
    console.error('Erreur lors du push :', error);
    process.exit(1);
  }

  // Créer le tag et le pusher
  try {
    execSync(`git tag ${nextVersion}`);
    execSync('git push --tags');
  } catch (error) {
    console.error('Erreur lors de la création ou du push du tag :', error);
    process.exit(1);
  }

  console.log(`Version mise à jour vers ${nextVersion}`);
})();
