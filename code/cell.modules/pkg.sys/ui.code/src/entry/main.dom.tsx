import '@platform/css/reset.css';

import { createRoot } from 'react-dom/client';
import { Is, log, rx, t } from '../common';

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
  const bus = rx.bus();
  const pump = rx.pump.create(bus);

  log.info('[hint] query-string (option): source=<url>?entry=<path>');
  const location = new URL(window.location.href);

  const sourceParam = location.searchParams.get('source');
  const url = sourceParam ? toUrl(sourceParam).href : location.href;

  const ctx: t.ModuleDefaultEntryContext = {
    source: { url, entry: '', namespace: 'sys.ui.code' },
  };

  const Module = await (isDev ? Imports.DevHarness() : Imports.App());
  const res = Module.default(pump, ctx);
  const el = Is.promise(res) ? await res : res;

  const root = createRoot(document.getElementById('root')!); // eslint-disable-line
  root.render(el);
})();

/**
 * Helpers
 */
function toUrl(input?: string | null) {
  const raw = !input || input === null ? '' : input;
  const output = raw
    .trim()
    .replace(/^http\:/, '')
    .replace(/^https\:/, '')
    .replace(/^\/\//, '');
  const protocol = output.startsWith('localhost') ? 'http' : 'https';
  const href = `${protocol}://${output}`;
  return new URL(href);
}
