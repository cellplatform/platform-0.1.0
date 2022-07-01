import { Compiler, Package } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('sys.runtime.web.ui')
    .version(Package.version)

    .variant('web', (config) =>
      config
        .title('system')
        .target('web')
        .port(5051)

        .entry('main', './src/entry/main')

        .static('static')
        .files((e) => e.redirect(false, '*.worker.js').access('public', '**/*.{png,jpg,svg}'))
        .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))

        .expose('./Dev', './src/Dev.Harness'),
    );
