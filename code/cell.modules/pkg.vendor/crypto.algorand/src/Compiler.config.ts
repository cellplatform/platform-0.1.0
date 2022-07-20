import { Compiler, Package } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('vendor.crypto.algorand')
    .version(Package.version)

    .variant('web', (config) =>
      config
        .target('web')
        .port(Package.compiler.port)

        .entry('main', './src/entry/main')

        .static('static')
        .files((e) => e.access('public', '**/*.{png,jpg,svg}'))
        .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))

        .expose('./Dev', './src/Dev.Harness'),
    );
