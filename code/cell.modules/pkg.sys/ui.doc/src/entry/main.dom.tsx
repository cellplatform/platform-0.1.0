import '@platform/css/reset.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { rx } from '../common';

const Imports = {
  DevHarness: () => import('../Dev.Harness'),
  App: () => import('../ui/DEV.Sample'),
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

  if (isDev) {
    const DevHarness = (await Imports.DevHarness()).DevHarness;
    ReactDOM.render(<DevHarness />, root);
  }

  if (!isDev) {
    const App = (await Imports.App()).App;
    const bus = rx.bus();
    ReactDOM.render(<App bus={bus} />, root);
  }
})();
