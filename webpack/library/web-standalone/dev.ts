import path from 'path';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import { Configuration } from 'webpack';

const webStandaloneDevConfig: Configuration = {
  output: {
    path: path.resolve(__dirname, '..', '..', '..', './.build-web'),
    filename: 'app.js',
    clean: true,
  },
  devServer: {
    port: process.env.PORT || 8080,
    hot: true,
    open: true,
  },
  plugins: [new ReactRefreshWebpackPlugin()],
};

export { webStandaloneDevConfig };
