import path from 'path';
import { Configuration } from 'webpack';

const webServedProdConfig: Configuration = {
  output: {
    path: path.resolve(__dirname, '..', '..', '..', './.build-web'),
    filename: 'app.[contenthash].js',
    clean: true,
  },
};

export { webServedProdConfig };
