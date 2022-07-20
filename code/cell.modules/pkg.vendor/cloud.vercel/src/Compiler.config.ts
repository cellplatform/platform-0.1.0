import { Compiler, Package } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('vendor.cloud.vercel')
    .version(Package.version)

    .variant('node', (config) =>
      config
        .namespace('vercel.sample.node')
        .target('node')
        .entry('./src/node.runtime/run')
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
        .files((e) => e.access('public', '**/*.{png,jpg,svg}'))

        .expose('./Dev', './src/Dev.Harness')
        .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom'])),
    );
