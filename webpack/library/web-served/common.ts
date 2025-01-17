import { Configuration } from 'webpack';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const webServedCommonConfig: Configuration = {
  target: 'web',
  entry: path.resolve(__dirname, '..', '..', '..', './source/client/index.tsx'),
  output: {
    path: path.resolve(__dirname, '..', '..', '..', './.build-web'),
    filename: 'app.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '..', '..', '..', 'source', 'client', 'index.html'),
      minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true,
      },
    }),
  ],
};

export { webServedCommonConfig };
