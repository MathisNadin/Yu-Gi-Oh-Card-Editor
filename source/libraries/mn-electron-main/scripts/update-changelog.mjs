/* eslint-disable no-console */
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const changelogFile = 'CHANGELOG.md';

// Obtenir les tags triés par date
const tags = execSync('git tag --sort=creatordate').toString().trim().split('\n');

// Ajouter 'HEAD' pour inclure les commits non tagués
tags.push('HEAD');

// Obtenir le nom du projet à partir du package.json
const packageJsonPath = join(process.cwd(), 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const projectName = packageJson.name || 'Project';

let changelog = `## ${projectName} change log\n\n`;

for (let i = tags.length - 1; i > 0; i--) {
  const currentTag = tags[i];
  const previousTag = tags[i - 1];

  const range = `${previousTag}..${currentTag}`;
  const log = execSync(`git log ${range} --pretty=format:"%s"`).toString().trim();

  const entries = log
    .split('\n')
    .filter((message) => message !== '=' && message !== '')
    .map((message) => `- ${message}`);

  if (entries.length > 0) {
    changelog += `## ${currentTag}\n\n${entries.join('\n')}\n\n`;
  }
}

// Écrire ou mettre à jour le fichier CHANGELOG.md
writeFileSync(changelogFile, changelog);
console.log(`Changelog mis à jour dans ${changelogFile}`);
