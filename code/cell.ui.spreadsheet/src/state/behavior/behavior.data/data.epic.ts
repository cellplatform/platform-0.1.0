import { distinctUntilChanged, filter } from 'rxjs/operators';
import { rx, t, Uri } from '../../../common';

export function init(args: { ctx: t.IAppContext; store: t.IAppStore }) {
  const { store, ctx } = args;
  const client = ctx.client;
  const event$ = ctx.event$;

  /**
   * EPIC: Listen for URI paste into address-bar.
   */
  rx.payload<t.IUiWindowAddressPasteEvent>(event$, 'UI:WindowAddress/paste').subscribe((e) => {
    const res = parse(e.text);
    const host = res.host || ctx.client.host;
    const ns = res.ns;
    if (host && ns) {
      store.dispatch({ type: 'APP:SHEET/ns', payload: { host, ns } });
    }
  });

  /**
   * Load data on NS change.
   */
  store.changed$
    .pipe(
      filter((e) => e.type === 'APP:SHEET/ns'),
      filter((e) => Boolean(e.to.ns)),
      distinctUntilChanged((prev, next) => prev.to.ns === next.to.ns),
    )
    .subscribe(async (e) => {
      const namespace = e.to.ns || '';
      const http = client.http;
      const res = await http.ns(namespace).read({ cells: true, rows: true, columns: true });

      const sheet = await client.sheet(namespace);
      const types = sheet.types;

      const { ns, cells = {}, rows = {}, columns = {} } = res.body.data;
      const data = { ns, cells, rows, columns, types };

      store.dispatch({
        type: 'APP:SHEET/data',
        payload: { data },
      });
    });

  /**
   * Patch data when updated on different process.
   */
  rx.payload<t.ITypedSheetSyncEvent>(event$, 'SHEET/sync')
    .pipe(
      filter((e) => Boolean(store.state.ns)),
      filter((e) => Uri.strip.ns(e.ns) === store.state.ns),
    )
    .subscribe((e) => {
      const { changes } = e;
      if (Object.keys(changes).length === 0) {
        return;
      }

      const state = store.state;
      if (state.data) {
        const payload: t.ISpreadsheetPatch = {};
        const copy = <K extends keyof t.ISpreadsheetPatch>(section: K) => {
          const data = (changes as any)[section] || {};
          Object.keys(data).forEach((key) => {
            payload[section] = payload[section] || {};
            payload[section][key] = data[key].to;
          });
        };
        copy('cells');
        copy('rows');
        copy('columns');
        ctx.fire({ type: 'APP:SHEET/patch', payload });
      }
    });
}

/**
 * [Helpers]
 */

function parse(input: string) {
  input = (input || '').trim();

  let text = stripQuotes(input);
  let host = '';
  let ns = '';

  if (input.startsWith('http:') || input.startsWith('http:')) {
    text = stripHttp(text);
    host = text.substring(0, text.indexOf('/'));
    text = text.substring(host.length + 1);
  }

  if (text.indexOf('?') > -1) {
    text = text.substring(0, text.indexOf('?'));
  }

  if (text.indexOf('/') > -1) {
    text = text.substring(0, text.indexOf('/'));
  }

  if (!text.includes(':')) {
    ns = text;
  } else {
    const uri = Uri.parse<t.INsUri>(text);
    if (uri.type === 'NS' && uri.ok) {
      ns = uri.parts.id;
    }
  }

  return { host, ns, input };
}

function stripHttp(text: string) {
  return text
    .replace(/^http\:/, '')
    .replace(/^https\:/, '')
    .replace(/\/\//, '');
}

function stripQuotes(text: string) {
  return text.replace(/^\"/, '').replace(/\"$/, '').replace(/^\'/, '').replace(/\'$/, '');
}
