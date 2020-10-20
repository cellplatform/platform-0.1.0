import { Compiler } from '@platform/cell.compiler';
export { Compiler };

// const TerserPlugin = require('terser-webpack-plugin');
// const vs = (path: string) => `monaco-editor/esm/vs/${path}`;

export default () =>
  Compiler.config('ide')
    .title('Code Editor')
    .url(3003)

    .entry('main', './src/test/entry')

    // .shared((e) => e.add(e.dependencies).singleton(['preset.web']))

    // .webpack //
    // .rule({ test: /\.ttf$/, use: ['file-loader'] })
    // .parent()

    // .beforeCompile((e) =>
    //   e.modify((webpack) => {
    //     // console.log('e.mode', e.model.mode);
    //     /**
    //      * NOTE: The [remoteEntry.js] file causes the Terser minifier to fail.
    //      *       This override avoids the error by exluding that file from minification.
    //      */
    //     webpack.optimization = {
    //       minimize: e.model.mode === 'production',
    //       minimizer: [new TerserPlugin({ exclude: [/remoteEntry\.js$/] })],
    //     };
    //   }),
    // )

    .variant('prod', (config) => config.mode('prod'))
    .variant('dev', (config) => config.mode('dev'));
// .variant('workers', (config) => {
//   config
//     .entry('main', null) // Remove
//     .entry({
//       'editor.worker': vs('editor/editor.worker.js'),
//       'json.worker': vs('language/json/json.worker'),
//       'css.worker': vs('language/css/css.worker'),
//       'html.worker': vs('language/html/html.worker'),
//       'ts.worker': vs('language/typescript/ts.worker'),
//     })
//     .target('webworker');
// });
