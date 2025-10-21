import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import { Configuration } from 'webpack';

const env = process.env.NODE_ENV || 'development';
const isDev = env === 'development';

const desktopRendererConfig: Configuration = {
  target: ['web', 'electron-renderer'],
  entry: path.join(__dirname, '..', '..', '..', 'source', 'client', 'index.tsx'),
  devServer: {
    port: process.env.PORT || 8080,
    hot: true,
  },
  output: {
    path: path.resolve(__dirname, '..', '..', '..', '.build-desktop'),
    filename: 'renderer.js',
    publicPath: isDev ? '/' : './',
    library: {
      type: 'umd',
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '..', '..', '..', 'source', 'client', 'index.html'),
      minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true,
        useShortDoctype: false,
      },
    }),
    new ReactRefreshWebpackPlugin(),
  ],
};

export { desktopRendererConfig };
