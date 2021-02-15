import { Compiler } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('sys.ui.video')
    .variant('web', (config) =>
      config
        .target('web')
        .port(3033)

        .entry('main', './src/entry/main')
        .declarations('./src/**/*')
        .static('static')
        .files((e) => e.redirect(false, '*.worker.js').access('public', '**/*.{png,jpg,svg}'))

        .expose('./Dev', './src/components/Dev')
        .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom'])),
    );