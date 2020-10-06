/* eslint-disable */

const deps = require('./package.json').dependencies;
const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

/**
 * Home
 */
module.exports = {
  output: {
    publicPath: 'http://localhost:3000/',
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  },

  devtool: 'eval-cheap-module-source-map',
  devServer: { port: 3000 },

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

  plugins: [
    new HtmlWebPackPlugin({ template: './src/index.html' }),
    new ModuleFederationPlugin({
      name: 'home',
      filename: 'remoteEntry.js',
      remotes: {
        'my-nav': 'nav@http://localhost:3001/remoteEntry.js',
      },
      exposes: {},
      shared: {
        ...deps,
        react: { singleton: true, requiredVersion: deps['react'] },
        'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
      },
    }),
  ],
};
