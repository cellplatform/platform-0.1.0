import { Compiler, Package } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('sys.data.json')
    .version(Package.version)

    .variant('web', (config) =>
      config
        .target('web')
        .port(3037)

        .entry('main', './src/entry/main')
        .declarations('./src/**/*')

        .static('static')
        .files((e) => e.access('public', '**/*.{png,jpg,svg}'))
        .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))

        .expose('./Dev', './src/Dev.Harness'),
    );
