import { Compiler } from '@platform/cell.compiler';

const pkg = require('../package.json') as { version: string; compiler: { port: number } };

export default () =>
  Compiler.config()
    .port(pkg.compiler.port)
    .namespace('foo.bar')
    .title('My Title')
    .entry('./src/test/entry.web')
    .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))
    .variant('prod', (config) => config.mode('prod'))
    .variant('dev', (config) => config.mode('dev'));
