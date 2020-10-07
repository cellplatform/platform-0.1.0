export const rules = [
  {
    test: /\.css$/i,
    use: ['style-loader', 'css-loader'],
  },
  {
    test: /\.(ts|tsx|js|jsx)$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-typescript', '@babel/preset-react', '@babel/preset-env'],
        plugins: ['@babel/plugin-proposal-class-properties'],
      },
    },
  },
];
