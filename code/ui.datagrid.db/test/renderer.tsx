import * as React from 'react';
import { hyperdb, renderer } from './common';
import { Test } from './components/Test';

renderer
  .render(<Test />, 'root', {
    getContext: async e => {
      const { ipc } = e.context;
      const databases = hyperdb.init({ ipc }).factory;
      return { databases };
    },
  })
  .then(context => context.log.info('renderer loaded!'));
