import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { Configuration } from 'webpack';
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
      new CssMinimizerPlugin(),
    ],
  },
  plugins: [
    new CspHtmlWebpackPlugin(
      {
        'style-src': ["'self'", 'https://fonts.googleapis.com'],
        'style-src-elem': ["'self'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
      },
      {
        enabled: true,
        hashingMethod: 'sha256',
      }
    ),
  ],
};

export { commonProdConfig };
