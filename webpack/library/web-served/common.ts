import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { Configuration } from 'webpack';

const webServedCommonConfig: Configuration = {
  target: 'web',
  entry: path.resolve(__dirname, '..', '..', '..', './source/client/index.tsx'),
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
