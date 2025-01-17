import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { Configuration } from 'webpack';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';

const env = process.env.NODE_ENV || 'development';
const isDev = env === 'development';

const entry: Configuration['entry'] = [];
if (isDev) {
  const port = process.env.PORT || 8072;
  entry.push(`webpack-dev-server/client?http://localhost:${port}/dist`);
  entry.push('webpack/hot/only-dev-server');
}
entry.push(path.join(__dirname, '..', '..', '..', 'source', 'client', 'index.tsx'));

const desktopRendererConfig: Configuration = {
  target: ['web', 'electron-renderer'],
  entry,
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
      },
    }),
    new ReactRefreshWebpackPlugin(),
  ],
};

export { desktopRendererConfig };
