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
        .expose('./SAMPLE.fs', './src/exports/Sample.Fs')

        /**
         * DEV (Development)
         */
        .expose('./DEV.ui.dev', './src/exports/Dev')
        .expose('./DEV.ui.video', './src/exports/Dev.Video')
        .expose('./DEV.ui.primitives', './src/exports/Dev.Primitives')
        .expose('./DEV.runtime.web', './src/exports/Dev.Runtime'),
    );
