import { Subject } from 'rxjs';

import { coord, ERROR, t } from '../common';

type E = t.TypedSheetEvent;

/**
 * Writes changes to a sheet to the server.
 */
export async function saveChanges(args: {
  http: t.IHttpClient;
  sheet: t.ITypedSheet;
  changes?: t.ITypedSheetChanges;
  event$?: Subject<E>;
}) {
  const { http, sheet, event$ } = args;
  const target = http.origin;
  const changes = args.changes || sheet.changes;

  const fire = (e: E) => {
    if (event$) {
      event$.next(e);
    }
  };

  // Fire BEFORE event.
  fire({ type: 'SHEET/saving', payload: { target, sheet, changes } });

  // Invoke save request (over network).
  const res = await write({ http, changes });
  const ok = res.ok && !res.error;
  const error = res.error as t.IHttpError | undefined;

  // Reset saved state for successful operation.
  if (ok) {
    sheet.state.clear.changes('SAVE');
  }

  // Fire AFTER event(s).
  fire({ type: 'SHEET/saved', payload: { ok, target, sheet, changes, error } });
  fire({ type: 'SHEET/sync', payload: { changes } });

  // Finish up.
  return { ok, changes, error };
}

/**
 * [Helpers]
 */

async function write(args: { http: t.IHttpClient; changes: t.ITypedSheetChanges }) {
  const { http, changes } = args;
  const client = http.ns(changes.uri);

  let error: t.IHttpError | undefined;
  let ok = true;
  let status = 200;

  if (changes.cells || changes.ns) {
    const payload = {
      cells: changes.cells ? toChangedCells(changes) : undefined,
      ns: changes.ns ? changes.ns.to : undefined,
    };

    const res = await client.write(payload, { data: false });
    ok = Boolean(res.ok && !res.error);
    status = res.status;

    if (!ok) {
      error = {
        status: res.status,
        type: ERROR.HTTP.SERVER,
        message: `Failed while saving data to ${http.origin}`,
        children: res.error ? [res.error] : undefined,
      };
    }
  }

  return { ok, status, error };
}

function toChangedCells(changes: t.ITypedSheetChanges) {
  const res: t.ICellMap = {};
  const cells = changes.cells || {};
  Object.keys(cells)
    .filter((key) => coord.cell.isCell(key))
    .forEach((key) => (res[key] = cells[key].to));
  return res;
}
