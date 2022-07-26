import { Compiler, Package } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('sys.ui.doc')
    .version(Package.version)

    .variant('web', (config) =>
      config
        .target('web')
        .port(5052)

        .entry('main', './src/entry/main')

        .static('static')
        .files((e) => e.access('public', '**/*.{png,jpg,svg}'))
        .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))

        .expose('./Dev', './src/entry/Export.Dev.Harness')
        .expose('./App', './src/entry/Export.Sample.App'),
    );
