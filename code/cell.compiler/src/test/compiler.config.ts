import { Compiler } from '..';
export { Compiler };

export default () =>
  Compiler.config('sample')
    .title('Compiler Samples')
    .url(1234)
    .entry('./src/test/entry')
    .remote('foo', 'foo@http://localhost:3001/remoteEntry.js')
    .remote('code', 'code@http://localhost:3002/remoteEntry.js')
    .shared((e) => {
      e.singleton(['@platform/react']);
    })
    .variant('prod', (config) => config.mode('production').target('node').lint(false))
    .variant('dev', (config) => config.mode('development').target('web'));
