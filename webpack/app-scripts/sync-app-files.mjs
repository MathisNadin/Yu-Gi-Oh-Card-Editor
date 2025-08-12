/*
 * Sync App Files (remote → local) with rsync-direct-first strategy.
 * ----------------------------------------------------------------------------
 * STRATEGY
 * - If rsync is available (native on Linux/macOS or via WSL on Windows),
 *   we mirror the remote folder directly into localAppFilesPath with --delete.
 *   -> No temp staging, safer and faster.
 * - If rsync is not available, fallback to scp:
 *   -> Copy remote folder into localTempFolderPath/app-files,
 *      then replace localAppFilesPath atomically (delete then move).
 *
 * SECURITY PRINCIPLES
 * - Validate all config fields.
 * - Refuse to operate on unsafe paths (root/system-like).
 * - For scp mode, wipe temp folder safely before use.
 * - For rsync mode, ensure destination folder exists and is safe
 *   (we never run rsync --delete on ambiguous/dangerous paths).
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { spawn } from 'node:child_process';

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
  console.error('❌ Impossible de charger platform-sync.js :', err.message);
  process.exit(1);
}

/* ------------------------------ Utilities -------------------------------- */

function sq(str) {
  return `'${String(str).replace(/'/g, `'\\''`)}'`;
}

// Run a command and collect stdout/stderr; reject on non-zero exit
function run(cmd, args = [], opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], ...opts });
    let out = '',
      err = '';
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (err += d));
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve({ stdout: out, stderr: err });
      else {
        const e = new Error(`Command failed: ${cmd} ${args.join(' ')} (code ${code})\n${err}`);
        e.code = code;
        e.stdout = out;
        e.stderr = err;
        reject(e);
      }
    });
  });
}

// Place this near your other helpers (alongside run)
function runInteractive(cmd, args = [], opts = {}) {
  // Run a process inheriting stdio so that tools (rsync/scp) can render progress bars
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', ...opts });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed: ${cmd} ${args.join(' ')} (code ${code})`));
    });
  });
}

// Binary detection helpers with cross-platform flags
const VERSION_FLAGS = {
  ssh: ['-V'],
  scp: ['-V'],
  rsync: ['--version'],
};
async function hasBinary(bin, flags = VERSION_FLAGS[bin] || ['--version', '-V']) {
  for (const f of flags) {
    try {
      await run(bin, [f]);
      return true;
    } catch {
      /* try next */
    }
  }
  try {
    if (process.platform === 'win32') await run('where', [bin]);
    else await run('which', [bin]);
    return true;
  } catch {
    return false;
  }
}
async function mustHaveBinary(bin) {
  if (!(await hasBinary(bin))) {
    console.error(`❌ Outil requis manquant: ${bin}`);
    process.exit(1);
  }
}

function isSafePath(p) {
  if (!p || typeof p !== 'string') return false;
  const normalized = path.resolve(p);
  if (!path.isAbsolute(normalized)) return false;

  // Forbid obviously dangerous roots or critical system dirs (exact matches)
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
  if (normalized.length < 8) return false; // simple heuristic against too-short paths
  return true;
}

function hasMinDepth(p, min = 2) {
  const parts = path.resolve(p).split(path.sep).filter(Boolean);
  return parts.length >= min;
}

async function ensureDirExists(dir) {
  try {
    const st = await fs.promises.stat(dir);
    if (!st.isDirectory()) throw new Error('not a directory');
  } catch (err) {
    throw new Error(`Le dossier n'existe pas: ${dir}`);
  }
}

async function ensureDirPresent(dir) {
  // Create directory if it does not exist
  await fs.promises.mkdir(dir, { recursive: true });
  const st = await fs.promises.stat(dir);
  if (!st.isDirectory()) throw new Error('Target path exists but is not a directory');
}

async function emptyDirSafe(dir) {
  if (!isSafePath(dir)) throw new Error(`Chemin jugé dangereux: ${dir}`);
  await fs.promises.rm(dir, { recursive: true, force: true });
  await fs.promises.mkdir(dir, { recursive: true });
}

/* ------------------------------ WSL helpers ------------------------------- */

// Detect if WSL is available (Windows only)
async function hasWSL() {
  if (process.platform !== 'win32') return false;
  try {
    await run('wsl', ['--status']);
    return true;
  } catch {
    return false;
  }
}

// Convert Windows backslashes to forward slashes before passing to WSL
function toPosixSlashes(p) {
  return p.replace(/\\/g, '/');
}

// Convert Windows path → WSL POSIX (/mnt/c/...) using wslpath
async function toWslPath(winPath) {
  const { stdout } = await run('wsl', ['wslpath', '-a', '-u', winPath]);
  return stdout.trim();
}

// Decide which rsync to use: native, wsl, or none
async function detectRsyncMode() {
  if (await hasBinary('rsync', ['--version'])) return { mode: 'native' };
  if (await hasWSL()) {
    try {
      await run('wsl', ['bash', '-lc', 'command -v rsync >/dev/null 2>&1']);
      return { mode: 'wsl' };
    } catch {
      /* ignore */
    }
  }
  return { mode: 'none' };
}

/* ------------------------------ Validation -------------------------------- */

const required = ['remoteHost', 'remoteUser', 'remoteAppFilesPath', 'localTempFolderPath', 'localAppFilesPath'];

for (const key of required) {
  if (config[key] === undefined || config[key] === null || config[key] === '') {
    console.error(`❌ Champ manquant dans la config: ${key}`);
    process.exit(1);
  }
}

if (!isSafePath(config.localAppFilesPath)) {
  console.error('❌ Chemin localAppFilesPath jugé dangereux. Abandon.');
  process.exit(1);
}
if (!isSafePath(config.localTempFolderPath)) {
  // Even if we won't use temp in rsync mode, validate safety early.
  console.error('❌ Chemin localTempFolderPath jugé dangereux. Abandon.');
  process.exit(1);
}
if (!hasMinDepth(config.localAppFilesPath)) {
  console.error('❌ Chemin trop peu profond pour un --delete sécurisé.');
  process.exit(1);
}

/* ------------------------------ Preflight --------------------------------- */

await mustHaveBinary('ssh');

// Check remote directory exists (robust & verbose)
console.log("🌐 Vérification de l'existence du dossier app-files distant...");
try {
  const checkScript = `
set -euo pipefail
echo "Whoami: $(whoami)"
echo "Home: $HOME"
TARGET=${sq(config.remoteAppFilesPath)}
echo "Check dir: $TARGET"
# Print details and follow symlinks if any
ls -ld -- "$TARGET" || true
if [ -L "$TARGET" ]; then echo "Note: $TARGET is a symlink → $(readlink -f -- "$TARGET" || true)"; fi
# Final guard: is it a directory?
[ -d "$TARGET" ] || { echo "Not a directory: $TARGET" >&2; exit 3; }
`;
  const { stdout, stderr } = await run(
    'ssh',
    ['-o', 'BatchMode=yes', `${config.remoteUser}@${config.remoteHost}`, 'bash', '-s'],
    {}
  );
  // feed script on stdin
  // run() n'accepte pas stdin, donc on passe par spawn manuel ici pour garder les logs
} catch {
  /* we’ll replace run() by a spawn below */
}
{
  // version spawn qui hérite de la sortie pour bien voir les messages
  await new Promise((resolve, reject) => {
    const child = spawn('ssh', ['-o', 'BatchMode=yes', `${config.remoteUser}@${config.remoteHost}`, 'bash', '-s'], {
      stdio: ['pipe', 'inherit', 'inherit'],
    });
    child.stdin.write(`
set -euo pipefail
echo "Whoami: $(whoami)"
echo "Home: $HOME"
TARGET=${sq(config.remoteAppFilesPath)}
echo "Check dir: $TARGET"
ls -ld -- "$TARGET" || true
if [ -L "$TARGET" ]; then echo "Note: $TARGET is a symlink → $(readlink -f -- "$TARGET" || true)"; fi
[ -d "$TARGET" ] || { echo "Not a directory: $TARGET" >&2; exit 3; }
`);
    child.stdin.end();
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`Remote dir check failed (exit ${code})`))));
  }).catch((err) => {
    console.error('❌ Le dossier app-files distant est introuvable ou inaccessible:', err.message);
    process.exit(1);
  });
}

// Detect rsync mode
const rsyncDetect = await detectRsyncMode();
if (rsyncDetect.mode === 'none') {
  console.warn('⚠️  rsync indisponible (natif/WSL). Bascule sur scp.');
  await mustHaveBinary('scp');
}

/* ------------------------------- Sync logic -------------------------------- */

const remotePath = `${config.remoteAppFilesPath.replace(/\\/g, '/')}/`;

// Ensure destination folder exists when using rsync mode
if (rsyncDetect.mode !== 'none') {
  try {
    // Safety: make sure we never run rsync --delete on a non-existing or unsafe path
    await ensureDirPresent(config.localAppFilesPath);
  } catch (err) {
    console.error('❌ Échec de préparation du dossier de destination:', err.message);
    process.exit(1);
  }
}

try {
  if (rsyncDetect.mode === 'native') {
    console.log('🚀 rsync natif détecté → synchronisation directe vers localAppFilesPath...');
    const remoteSpecNative = `${config.remoteUser}@${config.remoteHost}:${remotePath}`; // ← no quotes
    await runInteractive('rsync', [
      '-a',
      '--delete',
      '--info=progress2',
      '--human-readable',
      '--stats',
      '-e',
      'ssh',
      remoteSpecNative,
      `${config.localAppFilesPath.replace(/\\/g, '/')}/`,
    ]);
    console.log('🎉 Synchronisation des fichiers app-files terminée avec succès (rsync natif).');
    process.exit(0);
  }

  if (rsyncDetect.mode === 'wsl') {
    console.log('🚀 rsync via WSL détecté → synchronisation directe vers localAppFilesPath...');

    // Normalize Windows path (backslashes) before passing to wslpath, then convert to /mnt/...
    const destWsl = await toWslPath(config.localAppFilesPath.replace(/\\/g, '/'));

    // Build a safe remote spec
    const remoteSpecWSL = `${config.remoteUser}@${config.remoteHost}:${remotePath}`;

    // Build the rsync command to be executed inside WSL Bash
    // -e ssh keeps OpenSSH inside WSL; BatchMode avoids interactive prompts
    // We single-quote args and escape single quotes defensively.
    const q = (s) => `'${String(s).replace(/'/g, `'\\''`)}'`;
    const rsyncCmd =
      `rsync -a --delete --info=progress2 --human-readable --stats ` +
      `-e "ssh -o BatchMode=yes" ` +
      `${q(remoteSpecWSL)} ${q(destWsl)}/`;

    // Inherit stdio to render progress inside WSL bash
    await runInteractive('wsl', ['bash', '-lc', rsyncCmd]);

    console.log('🎉 Synchronisation des fichiers app-files terminée avec succès (rsync via WSL).');
    process.exit(0);
  }

  // -------------------------- Fallback: SCP staging --------------------------
  console.log('📦 Mode scp: copie dans le dossier temporaire puis remplacement...');

  // Ensure temp exists only in scp mode (not required for rsync)
  try {
    await ensureDirExists(config.localTempFolderPath);
  } catch (err) {
    console.error('❌ Le dossier temporaire local est introuvable:', err.message);
    process.exit(1);
  }

  // Prepare temp area
  console.log('🧹 Nettoyage du dossier temporaire local (wiped)...');
  const tempAppFiles = path.join(config.localTempFolderPath, 'app-files');
  try {
    await emptyDirSafe(config.localTempFolderPath);
    await fs.promises.mkdir(tempAppFiles, { recursive: true });
  } catch (err) {
    console.error('❌ Échec du nettoyage/préparation du dossier temporaire:', err.message);
    process.exit(1);
  }

  // Transfer remote → temp via scp
  console.log('⬇️  Transfert avec scp...');
  await runInteractive('scp', [
    '-r',
    `${config.remoteUser}@${config.remoteHost}:"${remotePath}."`,
    `${tempAppFiles.replace(/\\/g, '/')}/`,
  ]);

  console.log('✅ Fichiers app-files récupérés dans le dossier temporaire.');

  // Replace destination safely
  console.log('🧨 Remplacement sécurisé du dossier local app-files...');
  const localParent = path.dirname(config.localAppFilesPath);
  await fs.promises.mkdir(localParent, { recursive: true });

  // Remove existing destination if present
  const st = await fs.promises.stat(config.localAppFilesPath).catch(() => null);
  if (st && st.isDirectory()) {
    if (!isSafePath(config.localAppFilesPath)) {
      throw new Error(`Chemin jugé dangereux: ${config.localAppFilesPath}`);
    }
    await fs.promises.rm(config.localAppFilesPath, { recursive: true, force: true });
  } else if (st) {
    throw new Error("Le chemin localAppFilesPath existe mais n'est pas un dossier.");
  }

  // Move temp/app-files → localAppFilesPath (rename if possible; otherwise copy)
  try {
    await fs.promises.rename(tempAppFiles, config.localAppFilesPath);
  } catch (err) {
    if (err && err.code === 'EXDEV') {
      if (!fs.promises.cp) throw new Error('Cette version de Node ne supporte pas fs.cp pour copie récursive.');
      await fs.promises.cp(tempAppFiles, config.localAppFilesPath, { recursive: true });
      await fs.promises.rm(tempAppFiles, { recursive: true, force: true });
    } else {
      throw err;
    }
  }

  console.log('🎉 Synchronisation des fichiers app-files terminée avec succès (scp).');
} catch (err) {
  console.error('❌ Échec de la synchronisation des fichiers app-files:', err.stderr || err.message);
  process.exit(1);
}
