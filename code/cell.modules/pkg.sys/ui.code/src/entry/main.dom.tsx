import '@platform/css/reset.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { t, rx } from '../common';

const Imports = {
  DevHarness: () => import('./Export.Dev.Harness'),
  App: () => import('./Export.Sample.App'),
};

const query = () => {
  const url = new URL(location.href);
  const q = url.searchParams;
  if (q.has('dev')) return q;

  if (q.has('d')) {
    q.set('dev', q.get('d') || '');
    q.delete('d');
    window.history.pushState({}, '', url);
  }

  return q;
};

const isDev = query().has('dev');
if (isDev) document.title = `${document.title} (dev)`;

/**
 * [Render]
 */
(async () => {
  const root = document.getElementById('root');
  const bus = rx.bus();

  const ctx: t.ModuleDefaultEntryContext = {
    source: {
      url: location.href,
      entry: '',
      namespace: isDev ? 'sys.ui.code:dev' : 'sys.ui.code',
    },
  };

  if (isDev) {
    const Module = await Imports.DevHarness();
    const el = Module.default(bus, ctx);
    ReactDOM.render(el, root);
  }

  if (!isDev) {
    const Module = await Imports.App();
    const el = Module.default(bus, ctx);
    ReactDOM.render(el, root);
  }
})();
