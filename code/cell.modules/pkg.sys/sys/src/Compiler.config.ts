import { Compiler, Package } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('sys')
    .version(Package.version)

    .variant('web', (config) =>
      config
        .target('web')
        .port(Package.compiler.port)

        // .entry('main', './src/entry/main')

        .static('static')
        .files((e) => e.redirect(false, '*.worker.js').access('public', '**/*.{png,jpg,svg}'))
        .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))

        /**
         * Federated Exports
         */
        .expose('./Fs.Sample', './src/exports/Sample.Fs')
        .expose('./Fs.Video', './src/exports/Sample.Video'),
    );
