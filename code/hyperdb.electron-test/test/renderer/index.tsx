import '../../node_modules/@platform/css/reset.css';
import '@babel/polyfill';

import { renderer } from '@platform/electron/lib/renderer';
import * as React from 'react';
import { Shell } from './components/Shell';
import { init as initCli } from './cli';
import { hyperdb, t } from './common';

/**
 * [Renderer] entry-point.
 */
const el = <Shell />;
renderer
  .render(el, 'root', {
    getContext: async e => {
      const { ipc } = e.context;
      const db = hyperdb.init({ ipc }).factory;
      const cli = initCli({ ipc, db });
      return { cli, db };
    },
  })
  .then(context => context.log.info('renderer loaded!'));
