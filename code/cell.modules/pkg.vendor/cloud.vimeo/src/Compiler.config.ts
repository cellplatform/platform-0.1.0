import { Compiler, Package } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('cloud.vimeo')
    .version(Package.version)

    .variant('web', (config) =>
      config
        .target('web')
        .port(Package.compiler.port)

        .entry('main', './src/web/entry/main')

        .declarations('./src/**/*')

        .static('static')
        .files((e) => e.access('public', '**/*.{png,jpg,svg}'))

        .expose('./Dev', './src/Dev.Harness')
        .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom'])),
    );
