import '@platform/css/reset.css';

import { createRoot } from 'react-dom/client';

import { Is, rx, t } from '../common';
const pkg = require('../../package.json') as { name: string }; // eslint-disable-line

const Imports = {
  DevHarness: () => import('./Export.Dev.Harness'),
};

/**
 * [Render]
 */
(async () => {
  const bus = rx.bus();
  const pump = rx.pump.create(bus);

  const url = location.href;
  const ctx: t.ModuleDefaultEntryContext = {
    source: { url, entry: '', namespace: pkg?.name ?? '<unknown>' },
  };

  const Module = await Imports.DevHarness();
  const res = Module.default(pump, ctx);
  const el = Is.promise(res) ? await res : res;

  const root = createRoot(document.getElementById('root') as HTMLElement);
  root.render(el);
})();
