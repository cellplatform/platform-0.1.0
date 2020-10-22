import { Compiler } from '.';
export { Compiler };

export default () =>
  Compiler.config()
    .scope('sample.compiler')
    .title('Compiler Sample')
    .port(1234)
    .entry('./src/test/entry')
    .shared((e) => {
      e.singleton(['react', 'react-dom']);
    })
    .variant('prod', (config) => config.mode('prod'))
    .variant('dev', (config) => config.mode('dev'))

    .variant('node', (config) => {
      config.target('node').entry('./src/test/entry.node');
    });
