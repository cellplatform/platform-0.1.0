import { Compiler, Package } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('sys.runtime.electron')
    .version(Package.version)

    .variant('web', (config) =>
      config
        .target('web')
        .port(5055)

        .entry('main', './src/entry/dom')
        .entry('service.worker', './src/web.workers/service.worker')
        .entry('web.worker', './src/web.workers/web.worker')

        // .declarations('./src/**/*')

        .static('static')
        .files((e) => e.redirect(false, '*.worker.js').access('public', '**/*.{png,jpg,svg}'))

        .expose('./Dev', './src/Dev.Harness')
        .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom'])),
    );
