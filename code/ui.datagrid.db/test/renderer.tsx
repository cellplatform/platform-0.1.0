import dbRenderer from '@platform/fsdb.electron/lib/renderer';
import * as React from 'react';

import { log, renderer, t } from './common';
import { Test } from './components/Test';

const { app } = require('electron').remote;
const DIR = app.getPath('userData');
const FILE = 'test.db';
const CONN = `nedb:${DIR}/${FILE}`;

log.group('Database');
log.info('path:', `${DIR}/${FILE}`);
log.info('conn:', CONN);
log.groupEnd();

renderer
  .render(<Test />, 'root', {
    getContext: async e => {
      const { ipc } = e.context;
      const databases: t.DbFactory = dbRenderer.init({ ipc }).factory;
      const db = databases(CONN);
      return { db };
    },
  })
  .then(context => context.log.info('renderer loaded!'));
