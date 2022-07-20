import { Compiler, Config, Package } from '@platform/cell.compiler';

const web = (config: Config) =>
  config
    .target('web')
    .port(3040)
    .entry('main', './src/entry/main')

    // .declarations('./src/**/*')

    .static('static')
    .files((e) => e.access('public', '**/*.{png,jpg,svg}'))

    .expose('./Dev', './src/Dev.Harness')
    .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']));

/**
 * Configuration
 */
export default () =>
  Compiler.config()
    .namespace('sys.net')
    .version(Package.version)

    .variant('web.dev', (config) => web(config))
    .variant('web', (config) => {
      // NB: worker entries not included for development builds as
      //     they prevent effective hot-reloading.
      web(config);
      // .entry('service.worker', './src/workers/service.worker')
      // .entry('web.worker', './src/workers/web.worker');
    });
