import { Compiler } from '..';
export { Compiler };

export default () =>
  Compiler.config()
    .scope('sample.compiler')
    .title('Compiler Sample')
    .port(1234)
    .entry('./src/test/entry')
    .remote('foo', 'foo@http://localhost:3001/remoteEntry.js')
    .remote('code', 'code@http://localhost:3002/remoteEntry.js')
    .shared((e) => {
      e.singleton(['@platform/react']);
    })
    .variant('prod', (config) => config.mode('prod'))
    .variant('dev', (config) => config.mode('dev'));
