import { t } from '../common';

export const Rules = {
  default(): t.WpConfigRule[] {
    return [
      /**
       * CSS (Stylesheets)
       */
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },

      /**
       * Typescript
       */
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-typescript',
                {
                  /**
                   * NB: This is important for proper files watching
                   *     See:
                   *       - https://github.com/TypeStrong/fork-ts-checker-webpack-plugin#type-only-modules-watching
                   *       - https://github.com/TypeStrong/fork-ts-checker-webpack-plugin/blob/master/examples/babel-loader/.babelrc.js
                   *       - https://babeljs.io/docs/en/babel-preset-typescript#onlyremovetypeimports
                   */
                  onlyRemoveTypeImports: true,
                },
              ],
              '@babel/preset-react',
              '@babel/preset-env',
            ],
            plugins: ['@babel/plugin-proposal-class-properties'],
          },
        },
      },
    ];
  },
};
