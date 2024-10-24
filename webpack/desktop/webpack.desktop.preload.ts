import path from 'path';
import { Configuration } from 'webpack';
import nodeExternals from 'webpack-node-externals';

const desktopPreloadConfig: Configuration = {
  target: 'electron-preload',
  entry: path.join(__dirname, '..', '..', 'source', 'libraries', 'mn-electron-main', 'library', 'preload.ts'),
  output: {
    path: path.resolve(__dirname, '..', '..', '.temp-desktop'),
    filename: 'preload.js',
    library: {
      type: 'umd',
    },
  },
  externals: [nodeExternals()],
};

export default desktopPreloadConfig;
