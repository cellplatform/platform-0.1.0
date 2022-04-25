import { Compiler, Package } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('sys')
    .version(Package.version)

    .variant('web', (config) =>
      config
        .target('web')
        .port(5050)

        .static('static')
        .files((e) => e.redirect(false, '*.worker.js').access('public', '**/*.{png,jpg,svg}'))
        .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))

        /**
         * EXPORTS: Development
         */

        .expose('./DEV.sys.fs', './src/exports/Dev.Fs')
        .expose('./DEV.sys.data.crdt', './src/exports/Dev.Data.Crdt')
        .expose('./DEV.sys.data.json', './src/exports/Dev.Data.Json')
        .expose('./DEV.sys.ui.dev', './src/exports/Dev')
        .expose('./DEV.sys.ui.video', './src/exports/Dev.Video')
        .expose('./DEV.sys.ui.primitives', './src/exports/Dev.Primitives')
        .expose('./DEV.sys.runtime.web', './src/exports/Dev.Runtime.Web')
        .expose('./DEV.sys.runtime.web.ui', './src/exports/Dev.Runtime.Web.ui'),
    );
