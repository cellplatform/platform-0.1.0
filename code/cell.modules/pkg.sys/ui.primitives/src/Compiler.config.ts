import { Compiler, Package } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('sys.ui.primitives')
    .version(Package.version)

    .variant('web', (config) =>
      config
        .target('web')
        .port(3036)

        .entry('main', './src/entry/dom')

        .static('static')
        .files((e) => e.access('public', '**/*.{png,jpg,svg}'))
        .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))

        .expose('./Dev', './src/entry/Export.Dev.Harness'),
    );
