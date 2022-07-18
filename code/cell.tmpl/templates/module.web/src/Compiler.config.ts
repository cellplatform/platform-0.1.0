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
        .entry('worker.service', './src/workers/worker.service')

        // .declarations('./src/**/*')

        .static('static')
        .files((e) => e.redirect(false, '*.worker.js').access('public', '**/*.{png,jpg,svg}'))
        .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))

        .expose('./Dev', './src/Dev.Harness'),
    );
