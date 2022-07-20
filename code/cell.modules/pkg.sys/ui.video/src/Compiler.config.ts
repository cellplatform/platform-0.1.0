import { Compiler, Package } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('sys.ui.video')
    .version(Package.version)

    /**
     * Web (video component library)
     */
    .variant('web', (config) =>
      config
        .target('web')
        .port(3037)

        .entry('main', './src/entry/dom')
        .static('static')
        .files((e) => e.access('public', '**/*.{png,jpg,svg}'))

        .expose('./Dev', './src/Dev.Harness')
        .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom'])),
    );
