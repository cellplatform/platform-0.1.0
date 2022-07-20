import { Compiler, Package } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('sys.fs')
    .version(Package.version)

    .variant('node', (config) =>
      config
        .target('node')
        .entry('./src/node')
        // .declarations('./src/**/*')
        .shared((e) => e.add(e.dependencies)),
    )

    .variant('web', (config) =>
      config
        .target('web')
        .port(3041)

        .entry('main', './src/web/entry/main')

        // .declarations('./src/**/*')
        .static('static')

        .files((e) => e.access('public', '**/*.{png,jpg,svg}'))

        .expose('./Dev', './src/Dev.Harness')
        .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom'])),
    );
