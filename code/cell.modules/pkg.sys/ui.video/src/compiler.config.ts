import { Compiler, Package } from '@platform/cell.compiler';
import { fs } from '@platform/fs';

export default () =>
  Compiler.config()
    .namespace('sys.ui.video')

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
    )

    /**
     * Hooks
     */
    .afterCompile((e) => {
      /**
       * Put a copy of the [manifest.json] into the /static folder so that i
       * is available to dev/localhost.
       */
      fs.copySync(fs.join(e.dir, 'index.json'), fs.resolve('./static/index.json'));
    });
