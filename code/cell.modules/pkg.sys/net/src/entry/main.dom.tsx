import '@platform/css/reset.css';

import React from 'react';
import ReactDOM from 'react-dom';

const Imports = {
  DevHarness: () => import('../Dev.Harness'),
  DevSampleApp: () => import('../ui/DEV.Sample'),
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
  const Component = isDev
    ? (await Imports.DevHarness()).DevHarness
    : (await Imports.DevSampleApp()).DevSampleApp;

  ReactDOM.render(<Component />, document.getElementById('root'));
})();
