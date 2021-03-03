import { Compiler, Package } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('sys.ui.primitives')

    .variant('web', (config) =>
      config
        .target('web')
        .port(Package.compiler.port)

        .entry('main', './src/entry/main')
        // .declarations('./src/**/*')
        .static('static')
        .files((e) => e.redirect(false, '*.worker.js').access('public', '**/*.{png,jpg,svg}'))

        .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))
        .expose('./Dev', './src/components/Dev')
        .expose('./Button', './src/components.ref/button/Button')
        .expose('./Switch', './src/components.ref/button/Switch')
        .expose('./image', './src/components.ref/image/image')
        .expose('./Avatar', './src/components.ref/image/Avatar')
        .expose('./Text', './src/components.ref/text/Text')
        .expose('./TextInput', './src/components.ref/text/TextInput')
        .expose('./Tree', './src/components.ref/tree/Tree')
        .expose('./Spinner', './src/components.ref/spinner/Spinner'),
    );
