import { Compiler } from '@platform/cell.compiler';

const pkg = require('../package.json') as { version: string; compiler: { port: number } }; // eslint-disable-line

export default () =>
  Compiler.config('bar')
    .scope('sample.bar')
    .port(pkg.compiler.port)
    .scope('My Bar Title')
    .entry({ main: './src/test/entry' })
    .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))
    .variant('prod', (config) => config.mode('prod'))
    .variant('dev', (config) => config.mode('dev'));
