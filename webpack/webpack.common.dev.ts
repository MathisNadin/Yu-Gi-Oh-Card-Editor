import 'webpack-dev-server';
import { Configuration, EnvironmentPlugin, LoaderOptionsPlugin } from 'webpack';

const commonDevConfig: Configuration = {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  module: {
    rules: [
      // Styles
      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ],
      },
    ],
  },
  plugins: [
    new EnvironmentPlugin({
      NODE_ENV: 'development',
    }),
    new LoaderOptionsPlugin({
      debug: true
    }),
  ],
}

export default commonDevConfig;
