import { t } from '../common';
import * as HtmlWebPackPlugin from 'html-webpack-plugin';

/**
 * Converts a configuration state into a live webpack object.
 */
export function toWebpackConfig(model: t.WebpackModel) {
  const { mode, port } = model;
  const prod = mode === 'production';
  const publicPath = `http://localhost:${port}/`;

  const config: t.WebpackConfig = {
    mode,
    output: { publicPath },

    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    },

    devtool: prod ? undefined : 'eval-cheap-module-source-map',
    devServer: { port },

    module: {
      rules: [
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },
      ],
    },

    plugins: [new HtmlWebPackPlugin()],
  };

  return config;
}
