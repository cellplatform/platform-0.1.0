import * as React from 'react';

import { init as initCli } from './cli';
import { hyperdb, renderer } from './common';
import { Shell } from './components/Shell';

/**
 * [Renderer] entry-point.
 */
const el = <Shell />;
renderer
  .render(el, 'root', {
    getContext: async e => {
      const { ipc, log, store } = e.context;
      const databases = hyperdb.init({ ipc }).factory;
      const cli = initCli({ log, ipc, store, databases });
      return { cli, db: databases };
    },
  })
  .then(context => context.log.info('renderer loaded!'));
