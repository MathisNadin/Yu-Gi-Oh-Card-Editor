import path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { Configuration } from 'webpack';

const webServedDevConfig: Configuration = {
  output: {
    path: path.resolve(__dirname, '..', '..', '..', './.build-web'),
    filename: 'app.js',
    clean: true,
  },
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
};

export { webServedDevConfig };
