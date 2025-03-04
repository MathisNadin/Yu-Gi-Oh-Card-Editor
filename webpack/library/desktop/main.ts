import path from 'path';
import nodeExternals from 'webpack-node-externals';
import { Configuration } from 'webpack';

const desktopMainConfig: Configuration = {
  target: 'electron-main',
  entry: {
    main: path.join(
      __dirname,
      '..',
      '..',
      '..',
      'source',
      'libraries',
      'mn-electron-main',
      'library',
      'main',
      'main.ts'
    ),
    preload: path.join(
      __dirname,
      '..',
      '..',
      '..',
      'source',
      'libraries',
      'mn-electron-main',
      'library',
      'preload',
      'preload.ts'
    ),
  },
  output: {
    path: path.resolve(__dirname, '..', '..', '..', '.build-desktop'),
    filename: '[name].js',
    library: {
      type: 'umd',
    },
  },
  externals: [nodeExternals()],
};

export { desktopMainConfig };
