import 'webpack-dev-server';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { Configuration, LoaderOptionsPlugin, WebpackPluginInstance } from 'webpack';
import { FixDoctypePlugin } from './FixDoctypePlugin';
import { cspCommon } from './csp-common';

import type CspHtmlWebpackPluginClass from 'csp-html-webpack-plugin';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const CspHtmlWebpackPlugin = require('csp-html-webpack-plugin') as typeof CspHtmlWebpackPluginClass;

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
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                silenceDeprecations: ['import'],
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'style.css',
    }),
    new LoaderOptionsPlugin({
      debug: true,
    }),
    new CspHtmlWebpackPlugin(
      {
        ...cspCommon,

        'script-src': [...cspCommon['script-src']!, "'unsafe-inline'", "'unsafe-eval'", 'http://localhost:*'],

        'style-src': [
          ...cspCommon['style-src']!,
          // keep inline styles in dev (and avoid nonces for styles so browsers don't ignore 'unsafe-inline')
          "'unsafe-inline'",
        ],

        'style-src-elem': [...cspCommon['style-src-elem']!, "'unsafe-inline'"],

        'connect-src': [...cspCommon['connect-src']!, 'ws://localhost:*', 'wss://localhost:*'],
      },
      {
        enabled: true,
        hashingMethod: 'sha256',
        hashEnabled: {
          'style-src': false,
          'style-src-elem': false,
        },
        nonceEnabled: {
          'style-src': false,
          'style-src-elem': false,
        },
      }
    ) as unknown as WebpackPluginInstance,
    new FixDoctypePlugin(),
  ],
};

export { commonDevConfig };
