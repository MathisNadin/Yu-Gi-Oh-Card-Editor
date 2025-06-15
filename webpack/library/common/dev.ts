import 'webpack-dev-server';
import { Configuration, LoaderOptionsPlugin } from 'webpack';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const CspHtmlWebpackPlugin = require('csp-html-webpack-plugin');

const commonDevConfig: Configuration = {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  module: {
    rules: [
      // Styles
      {
        test: /\.s[ac]ss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [
    new LoaderOptionsPlugin({
      debug: true,
    }),
    new CspHtmlWebpackPlugin(
      {
        'style-src': ["'self'", 'https://fonts.googleapis.com'],
        'style-src-elem': ["'self'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
      },
      {
        enabled: false,
        hashingMethod: 'sha256',
      }
    ),
  ],
};

export { commonDevConfig };
