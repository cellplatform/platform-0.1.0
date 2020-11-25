import { Compiler, Package } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('__NAME__')
    .variant('web', (config) =>
      config
        .target('web')
        .port(Package.compiler.port)
        .entry('./src/test/web.entry')
        .entry('service.worker', './src/test/workers/service.worker')
        .static('./static')
        .expose('./Dev', './src/test/components/Dev')
        .files((e) => e.redirect(false, '*.worker.js').access('public', '**/*.{png,jpg,svg}'))
        .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom'])),
    );
