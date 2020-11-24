import { Compiler, Package } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .port(Package.compiler.port)
    .namespace('__NAME__')

    .static('./static')

    .variant('web', (e) =>
      e
        .target('web')
        .entry('./src/test/web.entry')
        .entry('service.worker', './src/test/workers/service.worker')
        .static('./static')
        .expose('./Dev', './src/test/components/Dev')
        .files((e) => e.redirect(false, '*.worker.js').access('public', '**/*.{png,jpg,svg}'))
        .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom'])),
    )

    .variant('node', (e) =>
      e
        .target('node')
        .entry('./src/test/node.entry')
        .shared((e) => e.add(e.dependencies)),
    );
