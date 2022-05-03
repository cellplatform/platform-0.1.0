import { Compiler, Package } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('dns.web')
    .version(Package.version)

    .variant('web', (config) =>
      config
        .title('Goodbye Paul')

        .target('web')
        .port(3000)
        .entry('main', './src/entry/main')

        .static('static')
        .files((e) => e.redirect(false, '*.worker.js').access('public', '**/*.{png,jpg,svg}'))
        .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))

        .expose('./Dev', './src/Dev.Harness'),
    );
