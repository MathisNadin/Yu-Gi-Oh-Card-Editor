import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { Configuration } from 'webpack';
import { FixDoctypePlugin } from './FixDoctypePlugin';
import { cspCommon } from './csp-common';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const CspHtmlWebpackPlugin = require('csp-html-webpack-plugin');

const commonProdConfig: Configuration = {
  mode: 'production',
  devtool: false,
  module: {
    rules: [
      // Styles
      {
        test: /\.s[ac]ss$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
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
    ),
    new FixDoctypePlugin(),
  ],
};

export { commonProdConfig };
