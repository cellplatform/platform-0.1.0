import { Compiler } from '.';
export { Compiler };

export default () =>
  Compiler.config()
    .scope('sample.compiler')
    .title('Compiler Sample')
    .port(1234)
    .entry('./src/test/entry.web')
    .shared((e) => {
      e.singleton(['react', 'react-dom']);
    })

    .variant('prod', (config) =>
      config
        .mode('prod')
        .beforeCompile((e) => {
          console.log('🐷 BEFORE compile ("prod"):', e.model.mode);
        })
        .afterCompile((e) => {
          console.log('🐷 AFTER compile ("prod"):', e.model.mode);
        }),
    )

    .variant('dev', (config) =>
      config
        .mode('dev')
        .beforeCompile((e) => {
          console.log('🐷 BEFORE compile ("dev"):', e.model.mode);
        })
        .afterCompile((e) => {
          console.log('🐷 AFTER compile ("dev"):', e.model.mode);
        }),
    )

    .variant('node', (config) => {
      config.target('node').entry('./src/test/entry.node');
    })

    // Root level hooks.
    .beforeCompile((e) => {
      console.log('🐷 BEFORE compile ("root"):', e.model.mode);
    })
    .afterCompile((e) => {
      console.log('🐷 AFTER compile ("root"):', e.model.mode);
    });
