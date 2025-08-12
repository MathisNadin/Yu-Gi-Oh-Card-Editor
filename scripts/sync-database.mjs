/*
 * Sync Database (remote → local) with strong safety checks.
 * ----------------------------------------------------------------------------
 * OVERVIEW
 * 1) Load configuration from platform-sync.js (CommonJS) inside an ESM script.
 * 2) Validate required fields and paths; ensure the local temp folder exists and is safe.
 * 3) Abort early if active local DB connections are detected (except pgAdmin 4).
 * 4) Stream a compressed dump directly over SSH:
 *    - Run: docker exec -i <container> env PGPASSWORD=<pwd> pg_dump -v -U <user> <db> --no-owner --no-privileges | gzip -c
 *    - Pipe SSH stdout into a local .sql.gz file under localTempFolderPath (with a live byte counter).
 * 5) Drop and recreate the local PostgreSQL database, then restore by streaming
 *    the compressed dump through Node zlib → psql (ON_ERROR_STOP=1).
 * 6) Delete the local dump file at the end.
 *
 * SAFETY & ROBUSTNESS
 * - Refuses unsafe local paths (e.g., root/system-like) and requires the temp folder to exist.
 * - Refuses to drop the local DB when active sessions are present (except pgAdmin 4).
 * - Uses a single, well-quoted remote command (no nested quoting hell); secrets are scoped via env.
 * - Fails fast on non-zero ssh exit codes; validates the dump is non-empty before proceeding.
 * - Shows pg_dump verbose output and a local transfer progress indicator.
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { promisify } from 'node:util';
import { spawn } from 'node:child_process';
import zlib from 'node:zlib';
import { Transform, pipeline as pipelineCb } from 'node:stream';

const pipeline = promisify(pipelineCb);

// Resolve project root relative to this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load CommonJS config from project root safely inside ESM
const require = createRequire(import.meta.url);
const configPath = path.resolve(__dirname, '..', 'config', 'platform-sync.js');
let config;
try {
  config = require(configPath);
} catch (err) {
  console.error('❌ Impossible de charger le platform-sync.js :', err.message);
  process.exit(1);
}

/* ------------------------------ Utilities -------------------------------- */

// Minimal single-quote shell escape: wraps in single quotes and escapes existing single quotes
function sq(str) {
  return `'${String(str).replace(/'/g, `'\\''`)}'`;
}

// POSIX-safe single-quote for shell tokens: '...'\''...'
function shq(s) {
  return `'${String(s).replace(/'/g, `'\\''`)}'`;
}

// Quote an SQL identifier safely (e.g., database name with a hyphen).
// This returns "my-db" -> "\"my-db\"" and escapes inner quotes: "a"b" -> "\"a\"\"b\""
function idq(name) {
  if (name === undefined || name === null) {
    throw new Error('Invalid SQL identifier');
  }
  return `"${String(name).replace(/"/g, '""')}"`;
}

// Run a command and collect stdout/stderr; reject on non-zero exit
function run(cmd, args = [], opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], ...opts });
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (err += d));
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) return resolve({ stdout: out, stderr: err });
      const e = new Error(`Command failed: ${cmd} ${args.join(' ')} (code ${code})\n${err}`);
      e.code = code;
      e.stdout = out;
      e.stderr = err;
      reject(e);
    });
  });
}

// Run a command inheriting stdio (for interactive progress bars)
function runInteractive(cmd, args = [], opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', ...opts });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed: ${cmd} ${args.join(' ')} (code ${code})`));
    });
  });
}

// Map binaries to version flags that work across platforms
const VERSION_FLAGS = {
  ssh: ['-V'], // OpenSSH prints version to stderr; exit code 0
  scp: ['-V'], // same as ssh
  rsync: ['--version'],
  psql: ['--version', '-V'],
};

// Try a few strategies to confirm a binary exists
async function hasBinary(bin) {
  // 1) Try known-good version flags
  const flags = VERSION_FLAGS[bin] || ['--version', '-V', '-v'];
  for (const f of flags) {
    try {
      await run(bin, [f]);
      return true;
    } catch (_) {
      /* keep trying */
    }
  }

  // 2) Use platform-native locator as a fallback
  try {
    if (process.platform === 'win32') {
      await run('where', [bin]);
    } else {
      await run('which', [bin]);
    }
    return true;
  } catch (_) {
    return false;
  }
}

// Check if a binary is available by attempting "--version"
async function mustHaveBinary(bin) {
  if (!(await hasBinary(bin))) {
    console.error(`❌ Outil requis manquant ou introuvable dans le PATH: ${bin}`);
    console.error(`ℹ️  Vérifie que ${bin} est installé et accessible. Par exemple:`);
    if (process.platform === 'win32') {
      console.error(`   - Installe OpenSSH (Windows 10/11) et relance le terminal`);
      console.error(`   - Test: ${bin} -V`);
    } else {
      console.error(`   - Test: ${bin} --version`);
    }
    process.exit(1);
  }
}

// Verify a path is safe for operations (absolute, not a critical directory)
function isSafePath(p) {
  if (!p || typeof p !== 'string') return false;
  const normalized = path.resolve(p);
  if (!path.isAbsolute(normalized)) return false;

  // Disallow root-like locations or obviously critical directories
  const dangerous = new Set(
    [
      '/',
      'C:\\',
      'C:/',
      os.homedir(),
      '/root',
      '/bin',
      '/etc',
      '/usr',
      '/var',
      '/boot',
      '/System',
      '/Windows',
      '/Users',
      '/Program Files',
    ].map((x) => path.resolve(x))
  );

  if (dangerous.has(normalized)) return false;

  // Additional heuristic: path length should be reasonably long
  if (normalized.length < 8) return false;

  return true;
}

// Ensure directory exists
async function ensureDirExists(dir) {
  try {
    const st = await fs.promises.stat(dir);
    if (!st.isDirectory()) throw new Error('not a directory');
  } catch (err) {
    throw new Error(`Le dossier n'existe pas: ${dir}`);
  }
}

// Human-readable bytes formatter
function formatBytes(n) {
  if (!Number.isFinite(n)) return `${n}`;
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

// Create a counting transform to report progress periodically
function makeByteCounter({ label, totalBytes = null, intervalMs = 1000 }) {
  let bytes = 0;
  const start = Date.now();
  const t = new Transform({
    transform(chunk, enc, cb) {
      bytes += chunk.length;
      this.push(chunk);
      cb();
    },
  });
  const timer = setInterval(() => {
    const elapsed = (Date.now() - start) / 1000;
    const speed = elapsed > 0 ? bytes / elapsed : 0;
    if (totalBytes) {
      const pct = ((bytes / totalBytes) * 100).toFixed(1);
      process.stderr.write(
        `\r${label}: ${formatBytes(bytes)} / ${formatBytes(totalBytes)} (${pct}%) @ ${formatBytes(speed)}/s   `
      );
    } else {
      process.stderr.write(`\r${label}: ${formatBytes(bytes)} transferred @ ${formatBytes(speed)}/s   `);
    }
  }, intervalMs);
  t.once('end', () => {
    clearInterval(timer);
    const elapsed = (Date.now() - start) / 1000;
    const speed = elapsed > 0 ? bytes / elapsed : 0;
    process.stderr.write(
      `\r${label}: ${formatBytes(bytes)} done in ${elapsed.toFixed(1)}s @ ${formatBytes(speed)}/s          \n`
    );
  });
  return t;
}

/* ------------------------------ Validation -------------------------------- */

const required = [
  'remoteHost',
  'remoteUser',
  'remotePsqlDocker',
  'remotePsqlDbName',
  'remotePsqlDbUser',
  'remotePsqlDbPassword',
  'localPsqlDbName',
  'localPsqlDbUser',
  'localPsqlDbPassword',
  'localPsqlDbPort',
  'localTempFolderPath',
];

for (const key of required) {
  if (config[key] === undefined || config[key] === null || config[key] === '') {
    console.error(`❌ Champ manquant dans la config: ${key}`);
    process.exit(1);
  }
}

if (!isSafePath(config.localTempFolderPath)) {
  console.error('❌ Chemin localTempFolderPath jugé dangereux. Abandon.');
  process.exit(1);
}

/* ------------------------------ Preflight --------------------------------- */

await mustHaveBinary('ssh');
await mustHaveBinary('psql');

await ensureDirExists(config.localTempFolderPath);

/* --------------------------- Active sessions check ------------------------- */

console.log('🔍 Vérification des connexions actives sur la base locale...');
const checkConnSQL = `
SELECT pid, usename, application_name, client_addr, state
FROM pg_stat_activity
WHERE datname = ${sq(config.localPsqlDbName)}
  AND pid <> pg_backend_pid()
  AND application_name NOT LIKE 'pgAdmin 4%';
`;

let activeRows = '';
try {
  const { stdout } = await run(
    'psql',
    [
      '-h',
      '127.0.0.1',
      '-U',
      config.localPsqlDbUser,
      '-p',
      String(config.localPsqlDbPort),
      '-d',
      'postgres',
      '-v',
      'ON_ERROR_STOP=1',
      '-tA',
      '-c',
      checkConnSQL,
    ],
    { env: { ...process.env, PGPASSWORD: config.localPsqlDbPassword } }
  );
  activeRows = stdout.trim();
} catch (err) {
  console.error('❌ Échec de la vérification des connexions actives:', err.stderr || err.message);
  process.exit(1);
}

if (activeRows) {
  console.error('❌ Des connexions actives sont détectées sur la base locale. Détails :\n' + activeRows);
  console.error('ℹ️  Arrêt immédiat pour éviter toute interruption non désirée.');
  process.exit(1);
}

/* ------------------ Dump to remote /tmp, scp to local, cleanup ------------- */

console.log('🌐 SSH: create dump in /tmp on the remote host, download it, then clean up...');

// Local destination path (where the .sql.gz will be saved)
const ts = new Date().toISOString().replace(/[:.]/g, '-');
const dumpFile = path.join(config.localTempFolderPath, `pg-dump-${config.localPsqlDbName}-${ts}.sql.gz`);

// Inside-container Postgres port (make configurable via config.remotePsqlDbPort; default 5432)
const remotePgPort = Number(config.remotePsqlDbPort || 5432);

// Remote /tmp target (on the HOST, not inside the container)
const remoteDumpPath = `/tmp/pg-dump-${config.remotePsqlDbName}-${ts}.sql.gz`;

// 1) Create the dump on the remote host's /tmp by running pg_dump inside the container
{
  // Build the inner command that will run *inside the container*:
  // - Export PGPASSWORD inside the container (no reliance on `docker exec -e`)
  // - Force TCP to 127.0.0.1:<port> to avoid Unix socket issues
  // - Verbose (-v) to surface progress/errors to stderr on your terminal
  const innerCmd =
    `set -e; ` +
    `export PGPASSWORD=${shq(config.remotePsqlDbPassword)}; ` +
    `pg_dump -v --no-owner --no-privileges ` +
    `-h 127.0.0.1 -p ${remotePgPort} ` +
    `-U ${shq(config.remotePsqlDbUser)} -d ${shq(config.remotePsqlDbName)}`;

  // Remote bash script (sent over SSH stdin) to avoid brittle one-line quoting.
  // - We resolve the docker binary on the host
  // - We exec a shell in the container to run the inner command
  // - We stream stdout to gzip *on the host* and write to /tmp
  // - `set -o pipefail` ensures any failure in the pipeline causes a non-zero exit
  const remoteScript =
    `
set -euo pipefail

DOCKER=$(command -v docker || echo /usr/bin/docker)
INNER=${shq(innerCmd)}
CONT=${shq(config.remotePsqlDocker)}
OUT=${shq(remoteDumpPath)}

# Run pg_dump inside the container; compress on the host; write to /tmp.
# pg_dump stderr is forwarded to your terminal (not mixed into the gzip stream).
"$DOCKER" exec -i "$CONT" sh -lc "$INNER" 2> >(cat >&2) | gzip -1 > "$OUT"

# Ensure we actually created a non-empty file on the host
[ -s "$OUT" ] || { echo "Remote dump is empty: $OUT" >&2; exit 1; }

# Optional diagnostics: show resulting file size on stderr
ls -lh "$OUT" 1>&2 || true
`.trim() + '\n';

  // Send the script via SSH stdin (bash -s reads from stdin). This avoids quoting hell.
  await new Promise((resolve, reject) => {
    const child = spawn(
      'ssh',
      ['-o', 'BatchMode=yes', `${config.remoteUser}@${config.remoteHost}`, 'bash', '-s'],
      { stdio: ['pipe', 'inherit', 'inherit'] } // inherit stderr to see pg_dump -v output
    );
    child.stdin.write(remoteScript);
    child.stdin.end();
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`remote dump failed (${code})`))));
  }).catch((err) => {
    console.error('❌ Échec lors de la création du dump sur le serveur distant:', err.message);
    process.exit(1);
  });
}

// 2) Copy the dump from /tmp (host) to local via scp (progress visible)
console.log('⬇️  Téléchargement du dump vers la machine locale...');
await new Promise((resolve, reject) => {
  const child = spawn(
    'scp',
    [`${config.remoteUser}@${config.remoteHost}:${remoteDumpPath}`, dumpFile],
    { stdio: 'inherit' } // inherit stdio to show scp progress
  );
  child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`scp failed (${code})`))));
}).catch(async (err) => {
  console.error('❌ Échec du téléchargement du dump:', err.message);
  try {
    await fs.promises.unlink(dumpFile);
  } catch {}
  process.exit(1);
});

// 3) Verify local dump is non-empty (hard guard before restore)
{
  const st = await fs.promises.stat(dumpFile).catch(() => null);
  if (!st || st.size === 0) {
    console.error('❌ Dump local vide:', dumpFile);
    try {
      await fs.promises.unlink(dumpFile);
    } catch {}
    process.exit(1);
  }
  console.log(`✅ Dump reçu: ${dumpFile}`);
}

// 4) Remove the dump on the remote host (with proof)
async function remoteCleanupDump(remoteDumpPath) {
  if (!remoteDumpPath || !remoteDumpPath.startsWith('/')) {
    console.warn('⚠️ Chemin distant invalide, skip cleanup:', remoteDumpPath);
    return;
  }
  const probeScript =
    `
set -euo pipefail
P=${shq(remoteDumpPath)}
if [ -e "$P" ]; then
  rm -f "$P" || { echo "__RM_FAILED__:$P" ; exit 12; }
fi
if [ -e "$P" ]; then
  echo "__STILL_THERE__:$P"
  exit 13
else
  echo "__CLEANED__:$P"
fi
`.trim() + '\n';

  await new Promise((resolve, reject) => {
    const child = spawn('ssh', ['-o', 'BatchMode=yes', `${config.remoteUser}@${config.remoteHost}`, 'bash', '-s'], {
      stdio: ['pipe', 'pipe', 'inherit'],
    });
    let out = '';
    child.stdout.on('data', (d) => (out += d));
    child.stdin.write(probeScript);
    child.stdin.end();
    child.on('close', (code) => {
      out = out.trim();
      if (out.includes('__CLEANED__')) {
        console.log('🧹 Dump distant supprimé.');
        resolve();
      } else if (out.includes('__STILL_THERE__')) {
        reject(new Error('Le dump distant existe encore après rm.'));
      } else if (out.includes('__RM_FAILED__')) {
        reject(new Error('rm a échoué côté distant.'));
      } else if (code === 0) {
        // Pas de marqueur mais exit 0 → on considère OK
        console.log('🧹 Dump distant: cleanup silencieux OK.');
        resolve();
      } else {
        reject(new Error(`Cleanup distant: code ${code}`));
      }
    });
  }).catch((err) => {
    console.error('❌ Échec du cleanup distant:', err.message);
  });
}
await remoteCleanupDump(remoteDumpPath);

/* ------------------------- Drop, recreate, restore ------------------------- */

console.log('🧨 Forcer la suppression (si elle existe) puis recréer la base de données locale...');

const env = { ...process.env, PGPASSWORD: config.localPsqlDbPassword };

// Common psql args connected to the maintenance DB "postgres"
const psqlArgsBase = [
  '-h',
  '127.0.0.1',
  '-U',
  config.localPsqlDbUser,
  '-p',
  String(config.localPsqlDbPort),
  '-d',
  'postgres',
  '-v',
  'ON_ERROR_STOP=1',
  '-c',
];

// Diagnostic: show who is connected right before we terminate them (best-effort)
try {
  const { stdout } = await run(
    'psql',
    [
      ...psqlArgsBase.slice(0, -1), // remove the last '-c' to insert our own flags
      '-tA',
      '-c',
      `
SELECT pid, usename, application_name, client_addr, state
FROM pg_stat_activity
WHERE datname = ${sq(config.localPsqlDbName)} AND pid <> pg_backend_pid();
`,
    ],
    { env }
  );
  const rows = (stdout || '').trim();
  if (rows) {
    console.warn('⚠️ Les connexions actives seront interrompues :\n' + rows);
  }
} catch {
  /* ignore diagnostics failures */
}

try {
  // 1) Disallow new connections if the DB exists (safe guard).
  //    Using a DO block avoids failing when the DB doesn't exist.
  await run(
    'psql',
    [
      ...psqlArgsBase,
      `
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_database WHERE datname = ${sq(config.localPsqlDbName)}) THEN
    EXECUTE 'ALTER DATABASE ' || quote_ident(${sq(config.localPsqlDbName)}) || ' WITH ALLOW_CONNECTIONS = false';
  END IF;
END $$;`,
    ],
    { env }
  );

  // 2) Terminate existing backends on that DB (sessions like pgAdmin "idle" included).
  await run(
    'psql',
    [
      ...psqlArgsBase,
      `
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = ${sq(config.localPsqlDbName)} AND pid <> pg_backend_pid();`,
    ],
    { env }
  );

  // 3) Drop the database (now that sessions are gone).
  await run('psql', [...psqlArgsBase, `DROP DATABASE IF EXISTS ${idq(config.localPsqlDbName)};`], { env });

  // 4) Recreate the database cleanly.
  await run('psql', [...psqlArgsBase, `CREATE DATABASE ${idq(config.localPsqlDbName)};`], { env });
} catch (err) {
  console.error('❌ Échec de la suppression/création forcée de la base de données locale :', err.stderr || err.message);
  process.exit(1);
}

console.log(
  '📥 Restauration du dump dans la nouvelle base de données locale... (progression indiquée sur le fichier compressé)'
);

try {
  const st = await fs.promises.stat(dumpFile);
  const totalBytes = st.size;

  const psqlChild = spawn(
    'psql',
    [
      '-h',
      '127.0.0.1',
      '-U',
      config.localPsqlDbUser,
      '-p',
      String(config.localPsqlDbPort),
      '-d',
      config.localPsqlDbName, // passing DB name as one argument is safe even with hyphens
      '-v',
      'ON_ERROR_STOP=1',
    ],
    { stdio: ['pipe', 'inherit', 'inherit'], env }
  );

  // Count bytes read from the compressed dump on disk for a simple progress indicator
  const counter = makeByteCounter({ label: 'Restore (read)', totalBytes });

  await pipeline(fs.createReadStream(dumpFile), counter, zlib.createGunzip(), psqlChild.stdin);

  const exitCode = await new Promise((resolve) => psqlChild.on('close', resolve));
  if (exitCode !== 0) {
    throw new Error(`psql restore exited with code ${exitCode}`);
  }
} catch (err) {
  console.error('❌ La restauration a échoué :', err.message);
  process.exit(1);
}

try {
  await fs.promises.unlink(dumpFile);
  console.log('🧹 Dump supprimé localement.');
} catch {
  console.warn('⚠️ Impossible de supprimer le dump local (vous pouvez le retirer manuellement):', dumpFile);
}

console.log('🎉 Synchronisation de la base terminée avec succès.');
