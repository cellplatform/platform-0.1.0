import { Compiler, Package } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('sys')
    .version(Package.version)

    .variant('web', (config) =>
      config
        .target('web')
        .port(Package.compiler.port)

        .static('static')
        .files((e) => e.redirect(false, '*.worker.js').access('public', '**/*.{png,jpg,svg}'))
        .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))

        /**
         * Exports
         */

        // DEV (Development)
        .expose('./DEV.sys.fs', './src/exports/Dev.Fs')
        .expose('./DEV.sys.ui.dev', './src/exports/Dev')
        .expose('./DEV.sys.ui.video', './src/exports/Dev.Video')
        .expose('./DEV.sys.ui.primitives', './src/exports/Dev.Primitives')
        .expose('./DEV.sys.runtime.web', './src/exports/Dev.Runtime')
        .expose('./DEV.sys.crdt', './src/exports/Dev.Crdt'),
    );
