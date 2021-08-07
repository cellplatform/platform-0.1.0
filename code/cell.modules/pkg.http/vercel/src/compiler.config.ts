import { Compiler, Package } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('http.vercel')
    .version(Package.version)

    .variant('node', (config) =>
      config
        .target('node')
        .entry('./src/node/index')
        // .declarations('./src/**/*')
        .shared((e) => e.add(e.dependencies)),
    )

    .variant('web', (config) =>
      config
        .target('web')
        .port(Package.compiler.port)

        .entry('main', './src/web/entry/main')

        // .declarations('./src/**/*')

        .static('static')
        .files((e) => e.redirect(false, '*.worker.js').access('public', '**/*.{png,jpg,svg}'))

        .expose('./Dev', './src/Dev.Harness')
        .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom'])),
    );
