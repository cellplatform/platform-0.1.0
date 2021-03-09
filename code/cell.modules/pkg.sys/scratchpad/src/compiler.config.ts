import { Compiler, Package } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('sys.scratchpad')

    .variant('web', (config) =>
      config
        .target('web')
        .port(Package.compiler.port)

        .entry('main', './src/entry/main')
        // .declarations('./src/**/*')
        .static('static')
        .files((e) =>
          e
            .redirect(false, 'static/**')
            .redirect(false, '*.worker.js')
            .access('public', '**/*.{png,jpg,svg}'),
        )

        .expose('./Dev', './src/components/Dev.Harness')
        .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom'])),
    );
