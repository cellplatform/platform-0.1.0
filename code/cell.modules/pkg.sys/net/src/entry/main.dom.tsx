import '@platform/css/reset.css';

import { createRoot } from 'react-dom/client';
import { rx, t, Is } from '../common';

const Imports = {
  DevHarness: () => import('./Export.Dev.Harness'),
  App: () => import('./Export.Sample.App'),
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

const isDev = query().has('dev');
if (isDev) document.title = `${document.title} (dev)`;

/**
 * [Render]
 */
(async () => {
  const bus = rx.bus();
  const pump = rx.pump.create(bus);

  const ctx: t.ModuleDefaultEntryContext = {
    source: { url: url.href, entry: '', namespace: 'sys.net' },
  };

  const Module = await (isDev ? Imports.DevHarness() : Imports.App());
  const res = Module.default(pump, ctx);
  const el = Is.promise(res) ? await res : res;

  const root = createRoot(document.getElementById('root') as HTMLElement);
  root.render(el);
})();
