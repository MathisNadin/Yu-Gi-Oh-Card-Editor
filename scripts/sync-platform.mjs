// Sync remote PostgreSQL (running in a Docker container) + remote 'app-files' folder to the local developer workstation
// Dependencies: pg, node-ssh, chalk (npm i -D pg node-ssh chalk)
// Requires: ssh key‑based access to the remote host.

import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { Client } from 'pg';
import { NodeSSH } from 'node-ssh';
import chalk from 'chalk';

/********************
 * Small helpers
 *******************/

// __dirname equivalent for ES modules
const __dirname = dirname(fileURLToPath(import.meta.url));

// Lightweight colored logger (French messages for the CLI)
const log = {
  info: (msg) => console.log(chalk.cyan('[INFO]'), msg),
  success: (msg) => console.log(chalk.green('[OK]'), msg),
  warn: (msg) => console.warn(chalk.yellow('[AVERT]'), msg),
  error: (msg) => console.error(chalk.red('[ERREUR]'), msg),
};

// Ensure a config key exists
function required(value, name) {
  if (!value) throw new Error(`Champ de configuration manquant : ${name}`);
  return value;
}

/********************
 * 1. Load & validate user config
 *******************/

const { default: cfg } = await import(join(__dirname, '..', 'config', 'platform-sync.js'));

[
  'remoteHost',
  'remoteUser',
  'remotePsqlDocker',
  'remotePsqlDbName',
  'remotePsqlDbUser',
  'remotePsqlDbPassword',
  'remoteAppFilesPath',
  'localPsqlDbName',
  'localPsqlDbUser',
  'localPsqlDbPassword',
  'localTempFolderPath',
  'localAppFilesPath',
].forEach((k) => required(cfg[k], k));

const tempDir = resolve(cfg.localTempFolderPath);
const tmpDumpFile = join(tempDir, `${cfg.remotePsqlDbName}-dump-${Date.now()}.sql`);
const tmpAppFilesDir = join(tempDir, 'app-files');

await fs.rm(tempDir, { recursive: true, force: true });
await fs.mkdir(tempDir, { recursive: true });
log.info(`Dossier temporaire prêt : ${tempDir}`);

/********************
 * 2. Download DB dump + app‑files over SSH
 *******************/

const ssh = new NodeSSH();
log.info(`Connexion SSH vers ${cfg.remoteUser}@${cfg.remoteHost}...`);
await ssh.connect({
  host: cfg.remoteHost,
  username: cfg.remoteUser,
  // Rely on your SSH agent / private key.
});
log.success('Connexion SSH établie');

const remoteDumpPath = `/tmp/${cfg.remotePsqlDbName}-dump-${Date.now()}.sql`;

// Build remote dump command executed inside container then redirected to host FS
const dumpCmd = `docker exec -e PGPASSWORD=\"${cfg.remotePsqlDbPassword}\" ${cfg.remotePsqlDocker} pg_dump -U ${cfg.remotePsqlDbUser} ${cfg.remotePsqlDbName} > ${remoteDumpPath}`;

log.info('Dump de la base distante... (patientez)');
const { stderr: dumpErr, code: dumpCode } = await ssh.execCommand(dumpCmd, {
  cwd: '/tmp',
});
if (dumpCode !== 0) throw new Error(`Échec pg_dump : ${dumpErr}`);
log.success('Dump distant terminé');

// Retrieve dump file
await ssh.getFile(tmpDumpFile, remoteDumpPath);
await ssh.execCommand(`rm -f ${remoteDumpPath}`);
log.success(`Dump copié localement : ${tmpDumpFile}`);

// Retrieve dossier app-files folder
log.info('Copie du dossier app-files distant...');
await ssh.getDirectory(tmpAppFilesDir, cfg.remoteAppFilesPath, {
  recursive: true,
  concurrency: 5,
});
log.success('Dossier app-files copié');
ssh.dispose();

/********************
 * 3. Drop + recreate local DB, then restore
 *******************/

log.info('Réinitialisation de la base locale...');
const adminClient = new Client({
  host: 'localhost',
  database: 'postgres',
  user: cfg.localPsqlDbUser,
  password: cfg.localPsqlDbPassword,
  port: cfg.localPsqlDbPort || 5432,
});
await adminClient.connect();
await adminClient.query(
  `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
  [cfg.localPsqlDbName]
);
await adminClient.query(`DROP DATABASE IF EXISTS \"${cfg.localPsqlDbName}\"`);
await adminClient.query(`CREATE DATABASE \"${cfg.localPsqlDbName}\" OWNER \"${cfg.localPsqlDbUser}\"`);
await adminClient.end();
log.success('Base locale recréée');

// Helper : test if CLI exists (rapid restore path)
async function commandExists(cmd) {
  return new Promise((res) => {
    const which = process.platform === 'win32' ? 'where' : 'which';
    const ps = spawn(which, [cmd]);
    ps.on('close', (code) => res(code === 0));
  });
}

if (await commandExists('psql')) {
  // Fast path with psql CLI
  log.info('psql CLI détecté ; restauration rapide...');
  await new Promise((res, rej) => {
    const env = { ...process.env, PGPASSWORD: cfg.localPsqlDbPassword };
    const psql = spawn(
      'psql',
      ['-U', cfg.localPsqlDbUser, '-d', cfg.localPsqlDbName, '-p', cfg.localPsqlDbPort || 5432, '-f', tmpDumpFile],
      { env }
    );
    psql.stderr.on('data', (d) => process.stderr.write(d));
    psql.stdout.on('data', (d) => process.stdout.write(d));
    psql.on('close', (code) => (code === 0 ? res() : rej(new Error(`psql code ${code}`))));
  });
  log.success('Restauration terminée via psql');
} else {
  // Slow fallback streaming via node‑postgres (no CLI on PATH)
  log.warn('psql CLI absent ; restauration lente en flux – installez le client Postgres pour accélérer.');
  const dbClient = new Client({
    host: 'localhost',
    database: cfg.localPsqlDbName,
    user: cfg.localPsqlDbUser,
    password: cfg.localPsqlDbPassword,
    port: cfg.localPsqlDbPort || 5432,
  });
  await dbClient.connect();
  const stream = fs.createReadStream(tmpDumpFile, { encoding: 'utf8' });
  let buffer = '';
  for await (const chunk of stream) {
    buffer += chunk;
    let idx;
    while ((idx = buffer.indexOf(';')) !== -1) {
      const statement = buffer.slice(0, idx + 1).trim();
      buffer = buffer.slice(idx + 2);
      if (statement) {
        await dbClient.query(statement).catch((err) => {
          log.error(`Statement échoué : ${statement.slice(0, 80)}...`);
          throw err;
        });
      }
    }
  }
  if (buffer.trim()) await dbClient.query(buffer);
  await dbClient.end();
  log.success('Restauration terminée via streaming JavaScript');
}

await fs.rm(tmpDumpFile, { force: true });
log.info('Fichier dump temporaire supprimé');

/********************
 * 4. Replace local app-files with downloaded copy
 *******************/

log.info('Mise à jour du dossier app-files local...');
await fs.rm(cfg.localAppFilesPath, { recursive: true, force: true });
await fs.mkdir(dirname(cfg.localAppFilesPath), { recursive: true }).catch(() => {});
await fs.rename(tmpAppFilesDir, cfg.localAppFilesPath);
log.success('Dossier app-files local mis à jour');

/********************
 * 5. Cleanup
 *******************/

await fs.rm(tempDir, { recursive: true, force: true });
log.info('Synchronisation terminée ✅');
