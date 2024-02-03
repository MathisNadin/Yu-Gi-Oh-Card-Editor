import path from 'path';
import { Configuration } from 'webpack';
import nodeExternals from 'webpack-node-externals';

const desktopMainConfig: Configuration = {
  target: 'electron-main',
  entry: {
    main: path.join(__dirname, '..', '..', 'source', 'libraries', 'mn-electron-main', 'main.ts'),
    preload: path.join(__dirname, '..', '..', 'source', 'libraries', 'mn-electron-main', 'preload.ts'),
  },
  output: {
    path: path.resolve(__dirname, '..', '..', '.build-desktop'),
    filename: '[name].js',
    library: {
      type: 'umd',
    },
  },
  externals: [nodeExternals()],
};

export default desktopMainConfig;
