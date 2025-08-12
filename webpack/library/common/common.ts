import path from 'path';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import { Configuration } from 'webpack';

const commonConfig: Configuration = {
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: [path.join(__dirname, '..', '..', '..', 'source'), 'node_modules'],
    plugins: [new TsconfigPathsPlugin()],
  },
  module: {
    rules: [
      // TS/JS Imports
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            // Remove this line to enable type checking in webpack builds
            transpileOnly: true,
            compilerOptions: {
              module: 'esnext',
            },
          },
        },
      },
      // Fonts & SVGs
      {
        test: /\.(woff(2)?|eot|ttf|otf|svg)$/,
        type: 'asset/inline',
      },
      // Images
      {
        test: /\.(png|jpg|jpeg|gif|ico|bmp|webp|avif)$/i,
        type: 'asset/resource',
      },
      // Audio
      {
        test: /\.(mp3|wav|ogg)$/i,
        type: 'asset/resource',
      },
      // Vidéo
      {
        test: /\.(mp4|webm)$/i,
        type: 'asset/resource',
      },
      // PDF
      {
        test: /\.pdf$/i,
        type: 'asset/resource',
      },
      // Texts
      {
        test: /\.(txt|md|csv|xml|ya?ml)$/i,
        use: 'raw-loader',
      },
    ],
  },
  performance: {
    hints: false,
  },
};

export { commonConfig };
