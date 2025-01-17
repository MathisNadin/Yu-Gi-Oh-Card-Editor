import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import { Configuration } from 'webpack';

const webStandaloneDevConfig: Configuration = {
  devServer: {
    hot: true,
    open: true,
    port: 8072,
  },
  plugins: [new ReactRefreshWebpackPlugin()],
};

export { webStandaloneDevConfig };
