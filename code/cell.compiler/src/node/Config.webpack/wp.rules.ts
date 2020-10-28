import { t } from './common';
import svgToMiniDataURI from 'mini-svg-data-uri';

type IArgs = { model: t.CompilerModel; isProd: boolean; isDev: boolean };

export const Rules = {
  /**
   * Initialize rules.
   */
  init(args: IArgs) {
    return [Rules.css(args), Rules.typescript(args), Rules.svg(args)];
  },

  /**
   * CSS (Stylesheets)
   */
  css(args: IArgs) {
    return {
      test: /\.css$/i,
      use: ['style-loader', 'css-loader'],
    };
  },

  /**
   * Typescript (language).
   */
  typescript(args: IArgs) {
    /**
     * 🌳 https://babeljs.io/docs/en/babel-preset-react
     */
    const presetReact = '@babel/preset-react';

    /**
     * 🌳 https://babeljs.io/docs/en/babel-preset-typescript
     */
    const presetTypescript = [
      '@babel/preset-typescript',
      {
        /**
         * NB: This is required for proper typescript file watching.
         *     See:
         *       - https://github.com/TypeStrong/fork-ts-checker-webpack-plugin#type-only-modules-watching
         *       - https://github.com/TypeStrong/fork-ts-checker-webpack-plugin/blob/master/examples/babel-loader/.babelrc.js
         *       - https://babeljs.io/docs/en/babel-preset-typescript#onlyremovetypeimports
         */
        onlyRemoveTypeImports: true,
      },
    ];

    /**
     * 🌳 https://babeljs.io/docs/en/babel-preset-env
     */
    const presetEnv = [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage', // https://babeljs.io/docs/en/babel-preset-env#usebuiltins
        corejs: 3, // https://babeljs.io/docs/en/babel-preset-env#corejs
      },
    ];

    return {
      test: /\.(ts|tsx|js|jsx)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [presetTypescript, presetReact, presetEnv],
          plugins: [
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-transform-modules-commonjs',
          ],
        },
      },
    };
  },

  /**
   * Plugin: <SVG> image support
   *         https://webpack.js.org/loaders/url-loader/#svg
   *
   * NOTE:
   *        See SVGO for optimizing source <SVG> data before webpacking.
   *        https://github.com/svg/svgo
   *
   *        React loader example (blog)
   *        https://www.pluralsight.com/guides/how-to-load-svg-with-react-and-webpack
   */
  svg(args: IArgs) {
    return {
      test: /\.svg$/i,
      use: [
        {
          loader: 'url-loader',
          options: {
            generator(content: any) {
              content = typeof content !== 'string' ? content.toString() : content;
              svgToMiniDataURI(content);
            },
          },
        },
      ],
    };
  },
};
