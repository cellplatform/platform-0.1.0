import '@platform/css/reset.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { rx } from '@platform/util.value/lib/rx';

const Imports = {
  DevHarness: () => import('../Dev.Harness'),
  Module: () => import('../ui/Module'),
};

const url = new URL(location.href);
const query = () => {
  const q = url.searchParams;
  if (q.has('dev')) return q;

  if (q.has('d')) {
    q.set('dev', q.get('d') || '');
    q.delete('d');
    window.history.pushState({}, '', url);
  }

  return q;
};

const isDev = query().has('dev') || url.pathname.startsWith('/sys/');
if (isDev) document.title = `${document.title} (dev)`;

/**
 * [Render]
 */
(async () => {
  const root = document.getElementById('root');

  if (isDev) {
    const DevHarness = (await Imports.DevHarness()).DevHarness;
    ReactDOM.render(<DevHarness />, root);
  } else {
    const Module = (await Imports.Module()).Module;

    const entry = url.searchParams.get('entry') ?? 'net.sys';
    const href = Module.Url.parseUrl('https://lib.db.team', { entry }).href;

    const bus = rx.bus();
    const instance = { bus };

    const el = <Module.App instance={instance} href={href} style={{ Absolute: 0 }} />;

    ReactDOM.render(el, root);
  }
})();
