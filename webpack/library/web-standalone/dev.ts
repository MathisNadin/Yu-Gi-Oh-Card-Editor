import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import { Configuration } from 'webpack';

const webStandaloneDevConfig: Configuration = {
  devServer: {
    port: process.env.PORT || 8080,
    hot: true,
    open: true,
  },
  plugins: [new ReactRefreshWebpackPlugin()],
};

export { webStandaloneDevConfig };
