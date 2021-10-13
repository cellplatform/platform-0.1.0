import { Compiler, Package } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('sys.ui.primitives')
    .version(Package.version)

    .variant('web', (config) =>
      config
        .target('web')
        .port(Package.compiler.port)

        .entry('main', './src/entry/dom')

        // .declarations('./src/**/*')

        .static('static')
        .files((e) => e.redirect(false, '*.worker.js').access('public', '**/*.{png,jpg,svg}'))

        .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))
        .expose('./Dev', './src/Dev.Harness'),
    );
