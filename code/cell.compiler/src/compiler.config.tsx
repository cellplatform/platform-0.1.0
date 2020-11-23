import * as React from 'react';

import { Compiler, Package } from '.';

export default () =>
  Compiler.config()
    .port(Package.compiler.port)
    .namespace('sample.compiler')
    .title('Compiler Sample')

    .entry('main', './src/test/entry.web')
    .entry('service.worker', './src/test/web/workers/service.worker')

    .static('./static')

    .env({ foo: 12345 })

    .shared((e) => e.singleton(['react', 'react-dom']))

    /**
     * TODO
     * .files
     *    .public(bool)
     */
    .files((files) => files.redirect(false, '*.worker.js'))

    .html((config) => {
      // config;
      // .head(
      //   <head>
      //     <title>FOOOOO</title>
      //   </head>,
      // )
      // .body(
      //   <body>
      //     <h1>Loading</h1>
      //     <div id={'root'}></div>
      //   </body>,
      // );
    })

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
      config.target('node').entry('./src/test/entry.node').static(null);
    })

    // Root level hooks.
    .beforeCompile((e) => {
      console.log(`🐷 SAMPLE BEFORE compile (name: "root", mode: "${e.model.mode}"):`);
    })
    .afterCompile((e) => {
      console.log(`🐷 SAMPLE AFTER compile (name: "root", mode: "${e.model.mode}"):`);
    });
