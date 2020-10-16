import { Compiler } from '@platform/cell.compiler';

const TerserPlugin = require('terser-webpack-plugin');

export const configure = () => {
  const vs = (path: string) => `monaco-editor/esm/vs/${path}`;

  const config = Compiler.config
    .create('code')
    .url(3002)
    .target('webworker')

    // .entry('main', './src/test/entry')

    .dir('dist/webworker')

    .entry({
      'editor.worker': vs('editor/editor.worker.js'),
      'json.worker': vs('language/json/json.worker'),
      'css.worker': vs('language/css/css.worker'),
      'html.worker': vs('language/html/html.worker'),
      'ts.worker': vs('language/typescript/ts.worker'),
    })

    // .expose('./CodeEditor', './src/components/CodeEditor')
    // .shared((e) => e.singleton(['react', 'react-dom']))
    // .rule({ test: /\.ttf$/, use: ['file-loader'] })

    .clone();

  config.beforeCompile((e) => {
    e.modify((webpack) => {
      /**
       * NOTE: The [remoteEntry.js] file causes the Terser minifier to fail.
       *       This override avoids the error by exluding that file from minification.
       */
      webpack.optimization = {
        minimize: true,
        minimizer: [new TerserPlugin({ exclude: [/remoteEntry\.js$/] })],
      };
    });
  });

  return config;
};

export default configure;
