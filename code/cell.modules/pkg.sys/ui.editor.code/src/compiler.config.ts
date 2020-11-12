import { Compiler, Package } from '@platform/cell.compiler';
import { copy } from './node/fs.copy';

export default () =>
  Compiler.config()
    .port(Package.compiler.port)
    .namespace('sys.ui.editor.code')
    .entry('./src/test/entry')
    .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))
    .static('./static')
    .redirect(false, 'static/**')

    .expose('./Dev', './src/test/App')
    .expose('./Editor', './src/components/Editor')

    .variant('prod', (config) => config.mode('prod'))
    .variant('dev', (config) => config.mode('dev'))

    .beforeCompile((e) => {
      copy.defs();
      copy.vs();
    });
