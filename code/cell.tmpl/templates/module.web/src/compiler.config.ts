import { Compiler, Package } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('__NAME__')
    .variant('web', (config) =>
      config
        .target('web')
        .port(Package.compiler.port)

        .entry('./src/entry/main')
        .entry('service.worker', './src/workers/service.worker')

        .declarations('./src/**/*')
        .static('static')
        .files((e) => e.redirect(false, '*.worker.js').access('public', '**/*.{png,jpg,svg}'))

        .expose('./Dev', './src/components/Dev')
        .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom'])),
    );
