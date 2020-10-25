import { Compiler } from '@platform/cell.compiler';
import { copy } from './node/fs.copy';

const pkg = require('../package.json') as { version: string; compiler: { port: number } }; // eslint-disable-line

export default () =>
  Compiler.config()
    .port(pkg.compiler.port)
    .namespace('sys.ui.editor.code')
    .entry('./src/test/entry')
    .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))

    .expose('./Dev', './src/test/App')
    .expose('./Editor', './src/components/Editor')

    .variant('prod', (config) => config.mode('prod'))
    .variant('dev', (config) => config.mode('dev'))

    .afterCompile((e) => copy.vs(['dist/web/vs', 'lib.monaco/vs', `${e.dir}/vs`]));
