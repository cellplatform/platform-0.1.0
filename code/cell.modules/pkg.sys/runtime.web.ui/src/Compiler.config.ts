import { Compiler, Package } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('sys.runtime.web.ui')
    .version(Package.version)

    .variant('web', (config) =>
      config
        .title('sys.cell')
        .target('web')
        .port(5051)

        .entry('main', './src/entry/main')
        .entry('service', './src/workers/worker.service')

        .static('static')
        .files((e) => e.access('public', '**/*.{png,jpg,svg}'))
        .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))

        /**
         * EXPORTS: Development
         */
        .expose('./Dev', './src/Dev.Harness')
        .expose('./DEV_SAMPLE.Foo', './src/exports.sample/Foo')
        .expose('./DEV_SAMPLE.error (on module load)', './src/exports.sample/ERROR.OnModuleLoad')
        .expose('./DEV_SAMPLE.error (on render)', './src/exports.sample/ERROR.OnRender'),
    );
