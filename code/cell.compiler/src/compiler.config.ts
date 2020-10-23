import { Compiler } from '.';

const pkg = require('../package.json') as { version: string; compiler: { port: number } }; // eslint-disable-line

export default () =>
  Compiler.config()
    .scope('sample.compiler')
    .title('Compiler Sample')
    .port(pkg.compiler.port)
    .entry('./src/test/entry.web')
    .shared((e) => {
      e.singleton(['react', 'react-dom']);
    })

    .variant('prod', (config) =>
      config
        .mode('prod')
        .beforeCompile((e) => {
          console.log(`🐷 BEFORE compile (name: "prod", mode: "${e.model.mode}"):`);
        })
        .afterCompile((e) => {
          console.log(`🐷 AFTER compile (name: "prod", mode: "${e.model.mode}"):`);
        }),
    )

    .variant('dev', (config) =>
      config
        .mode('dev')
        .beforeCompile((e) => {
          console.log(`🐷 BEFORE compile (name: "dev", mode: "${e.model.mode}"):`);
        })
        .afterCompile((e) => {
          console.log(`🐷 AFTER compile (name: "dev", mode: "${e.model.mode}"):`);
        }),
    )

    .variant('node', (config) => {
      config.target('node').entry('./src/test/entry.node');
    })

    // Root level hooks.
    .beforeCompile((e) => {
      console.log(`🐷 BEFORE compile (name: "root", mode: "${e.model.mode}"):`);
    })
    .afterCompile((e) => {
      console.log(`🐷 AFTER compile (name: "root", mode: "${e.model.mode}"):`);
    });
