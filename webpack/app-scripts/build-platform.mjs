import { spawnSync, execSync } from 'child_process';
import { relative } from 'path';

// Récupération des arguments :
//   0: node, 1: script, 2: platform, 3: env (optionnel)
const [, , platform, envArg] = process.argv;

if (!platform) {
  console.error('Usage: node scripts/build-platform.js <platform> [env]');
  console.error('Platforms: web-served, web-standalone, desktop-main, desktop-renderer, desktop');
  process.exit(1);
}

// Détermination de l'environnement (fallback à "production")
const nodeEnv = envArg || process.env.NODE_ENV || 'production';
// eslint-disable-next-line no-console
console.log(`▶️  Build "${platform}" avec NODE_ENV=${nodeEnv}`);

// Chemin du script courant pour les appels récursifs
const scriptPath = relative(process.cwd(), process.argv[1]);

switch (platform) {
  case 'web-served':
  case 'web-standalone':
    // Build Web
    spawnSync(
      'npx',
      ['cross-env', `NODE_ENV=${nodeEnv}`, `PLATFORM=${platform}`, 'webpack', '--config', 'webpack/index.ts'],
      { stdio: 'inherit', shell: true }
    );
    break;

  case 'desktop-main':
  case 'desktop-renderer':
    // Build desktop (main ou renderer)
    spawnSync(
      'npx',
      [
        'cross-env',
        `NODE_ENV=${nodeEnv}`,
        `PLATFORM=${platform}`,
        'TS_NODE_TRANSPILE_ONLY=true',
        'webpack',
        '--config',
        'webpack/index.ts',
      ],
      { stdio: 'inherit', shell: true }
    );
    break;

  case 'desktop':
    // Nettoyage avant build desktop
    execSync('node scripts/clean-build-desktop.js', { stdio: 'inherit', shell: true });

    // Build desktop-main et desktop-renderer en parallèle via concurrently
    execSync(
      `npx concurrently "node ${scriptPath} desktop-main ${nodeEnv}" "node ${scriptPath} desktop-renderer ${nodeEnv}"`,
      { stdio: 'inherit', shell: true }
    );
    break;

  default:
    console.error(`⚠️ Plateforme inconnue : ${platform}`);
    process.exit(1);
}
