import { Compiler, Package } from '.';

export default () =>
  Compiler.config()
    .port(Package.compiler.port)
    .namespace('sample.compiler')
    .title('Compiler Sample')

    .entry('main', './src/test/entry.web')
    .entry('service.worker', './src/test/web/service.worker')

    .static('./static')

    .env({ foo: 1234 })

    .shared((e) => e.singleton(['react', 'react-dom']))

    .variant('prod', (config) =>
      config
        .mode('prod')
        .beforeCompile((e) => {
          console.log(`🐷 SAMPLE BEFORE compile (name: "prod", mode: "${e.model.mode}"):`);
        })
        .afterCompile((e) => {
          console.log(`🐷 SAMPLE AFTER compile (name: "prod", mode: "${e.model.mode}"):`);
        }),
    )

    .variant('dev', (config) =>
      config
        .mode('dev')
        .beforeCompile((e) => {
          console.log(`🐷 SAMPLE BEFORE compile (name: "dev", mode: "${e.model.mode}"):`);
        })
        .afterCompile((e) => {
          console.log(`🐷 SAMPLE AFTER compile (name: "dev", mode: "${e.model.mode}"):`);
        }),
    )

    .variant('node', (config) => {
      config.target('node').entry('./src/test/entry.node');
    })

    // Root level hooks.
    .beforeCompile((e) => {
      console.log(`🐷 SAMPLE BEFORE compile (name: "root", mode: "${e.model.mode}"):`);
    })
    .afterCompile((e) => {
      console.log(`🐷 SAMPLE AFTER compile (name: "root", mode: "${e.model.mode}"):`);
    });
