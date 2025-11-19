import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { Configuration, WebpackPluginInstance } from 'webpack';
import { FixDoctypePlugin } from './FixDoctypePlugin';
import { cspCommon } from './csp-common';

import type CspHtmlWebpackPluginClass from 'csp-html-webpack-plugin';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const CspHtmlWebpackPlugin = require('csp-html-webpack-plugin') as typeof CspHtmlWebpackPluginClass;

const commonProdConfig: Configuration = {
  mode: 'production',
  devtool: false,
  module: {
    rules: [
      // Styles
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
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
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
      }),
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              minifySelectors: false,
            },
          ],
        },
      }),
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'style.[contenthash].css',
    }),
    new CspHtmlWebpackPlugin(
      {
        ...cspCommon,

        'script-src': [
          ...cspCommon['script-src']!,
          // keep only if you still have inline scripts without nonce/hash
          "'unsafe-inline'",
          // do NOT include 'unsafe-eval' in prod
        ],

        'style-src': [
          ...cspCommon['style-src']!,
          // keep if AdSense / your app inject inline styles; remove if you serve CSS files only
          "'unsafe-inline'",
        ],

        'style-src-elem': [
          ...cspCommon['style-src-elem']!,
          // keep if AdSense / your app inject inline styles; remove if you serve CSS files only
          "'unsafe-inline'",
        ],
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

export { commonProdConfig };
