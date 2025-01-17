import path from 'path';
import nodeExternals from 'webpack-node-externals';
import { Configuration } from 'webpack';

const desktopPreloadConfig: Configuration = {
  target: 'electron-preload',
  entry: path.join(
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
  output: {
    path: path.resolve(__dirname, '..', '..', '..', '.temp-desktop'),
    filename: 'preload.js',
    library: {
      type: 'umd',
    },
  },
  externals: [nodeExternals()],
};

export { desktopPreloadConfig };
