import { Compiler, Config, Package } from '@platform/cell.compiler';

const web = (config: Config) =>
  config
    .target('web')
    .port(3040)
    .entry('main', './src/entry/main')

    .static('static')
    .files((e) => e.access('public', '**/*.{png,jpg,svg}'))

    .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))

    .expose('./App', './src/entry/Export.Sample.App')
    .expose('./Dev', './src/entry/Export.Dev.Harness');

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
    });
