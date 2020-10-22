import { Compiler } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .port(3003)
    .scope('sys.ui.editor.code')
    .entry('./src/test/entry')
    .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))

    .expose('./Dev', './src/test/App')
    .expose('./Editor', './src/components/Editor')

    .variant('prod', (config) => config.mode('prod'))
    .variant('dev', (config) => config.mode('dev'));
