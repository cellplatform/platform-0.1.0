import { Compiler, Config, Package } from '@platform/cell.compiler';

const web = (config: Config) =>
  config
    .target('web')
    .port(Package.compiler.port)
    .entry('main', './src/entry/dom')

    // .declarations('./src/**/*')

    .static('static')
    .files((e) =>
      e
        .redirect(false, 'static/**')
        .redirect(false, '*.worker.js')
        .access('public', '**/*.{png,jpg,svg}'),
    )

    .expose('./Dev', './src/Dev.Harness')
    .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']));

export default () =>
  Compiler.config()
    .namespace('sys.scratchpad')
    .version(Package.version)

    .variant('web.dev', (config) => web(config))
    .variant('web', (config) => {
      // NB: worker entries not included for development builds as
      //     they prevent effect hot-reloading.
      web(config)
        .entry('service.worker', './src/workers/service.worker')
        .entry('web.worker', './src/workers/web.worker');
    });
