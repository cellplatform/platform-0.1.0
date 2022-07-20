import { Compiler, Package } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('__NAME__')
    .version(Package.version)

    .variant('web', (config) =>
      config
        .target('web')
        .port(3000)

        .entry('main', './src/entry/main')
        .entry('service', './src/workers/worker.service')

        // .declarations('./src/**/*')

        .static('static')
        .files((e) => e.access('public', '**/*.{png,jpg,svg}'))
        .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))

        .expose('./Dev', './src/Dev.Harness'),
    );
