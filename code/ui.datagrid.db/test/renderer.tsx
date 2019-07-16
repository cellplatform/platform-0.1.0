import * as React from 'react';
import { renderer, t } from './common';
import { Test } from './components/Test';

import dbRenderer from '@platform/fs.db.electron/lib/renderer';

renderer
  .render(<Test />, 'root', {
    getContext: async e => {
      const { ipc } = e.context;
      const databases: t.DbFactory = dbRenderer.init({ ipc }).db;
      return { databases };
    },
  })
  .then(context => context.log.info('renderer loaded!'));
