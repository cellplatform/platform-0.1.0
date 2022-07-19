import * as React from 'react';

import { Compiler, Package } from '.';

export default () =>
  Compiler.config()
    .port(Package.compiler.port)
    .version(Package.version)
    .namespace('sample.compiler')
    .title('Compiler Sample')
    .env({ foo: 1234 })

    .files((files) => files.redirect(false, '*.worker.js').access('public', '**/*.png'))

    .variant('web', (config) =>
      config
        .target('web')
        .entry('main', './src/test/entry.web/dom')
        .entry('worker.service', './src/test/entry.web/workers/worker.service')

        .static('./static')
        .shared((e) => e.singleton(['react', 'react-dom']))

        .expose('./Sample', './src/test/entry.web/components/App')

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

        .beforeCompile((e) => {
          console.log(`🐷 SAMPLE BEFORE compile (name: "web", mode: "${e.model.mode}"):`);
        })
        .afterCompile((e) => {
          console.log(`🐷 SAMPLE AFTER compile (name: "web", mode: "${e.model.mode}"):`);
        }),
    )

    .variant('node', (config) =>
      config
        // .mode('dev')
        .target('node')
        .entry('./src/test/entry.node/entry')
        .declarations('./src/test/entry.node/**/*', 'types.d/sample')
        .beforeCompile((e) => {
          console.log(`🐷 SAMPLE BEFORE compile (name: "node", mode: "${e.model.mode}"):`);
        })
        .afterCompile((e) => {
          console.log(`🐷 SAMPLE AFTER compile (name: "node", mode: "${e.model.mode}"):`);
        }),
    )

    // .variant('node', (config) => {
    //   config.target('node').entry('./src/test/entry.node').static(null);
    // })

    // Root level hooks.
    .beforeCompile((e) => {
      console.log(`🐷 SAMPLE BEFORE compile (name: "root", mode: "${e.model.mode}"):`);
    })
    .afterCompile((e) => {
      console.log(`🐷 SAMPLE AFTER compile (name: "root", mode: "${e.model.mode}"):`);
    });
