import { Subject } from 'rxjs';
import { HttpClient, ERROR } from './common';
import * as t from './_types';

type E = t.SheetEvent;
type F = t.ISheetFetcher;
type GetType = F['getType'];
type GetCells = F['getCells'];
type GetColumns = F['getColumns'];

/**
 * Constructs a sheet-data-fetcher from an HTTP host/client.
 */
function fromClient(args: { client: string | t.IHttpClient; events$?: Subject<t.SheetEvent> }): F {
  const { events$ } = args;
  const client = typeof args.client === 'string' ? HttpClient.create(args.client) : args.client;

  const getType: GetType = async args => {
    const res = await client.ns(args.ns).read();
    const exists = res.body.exists;
    let error: t.IHttpError | undefined;

    if (!exists) {
      const message = `The namespace [${args.ns}] does not exist.`;
      error = { status: 404, message, type: ERROR.HTTP.NOT_FOUND };
    }

    const type = res.body.data.ns.props?.type;
    if (!type) {
      const message = `The namespace [${args.ns}] does not contain a type reference.`;
      error = { status: 422, message, type: ERROR.HTTP.NOT_FOUND };
    }

    return { exists, type, error };
  };

  const getCells: GetCells = async args => {
    const { ns, query } = args;
    const res = await client.ns(ns).read({ cells: query });
    const error = asError(
      res.error,
      msg => `Failed to retrieve cells "${query}" within namespace [${ns}]. ${msg}`,
    );
    const exists = res.body.exists;
    const cells = res.body.data.cells || {};
    return { exists, cells, error };
  };

  const getColumns: GetColumns = async args => {
    const res = await client.ns(args.ns).read({ columns: true });
    const error = asError(
      res.error,
      msg => `Failed to retrieving type information from namespace [${args.ns}]. ${msg}`,
    );
    const exists = res.body.exists;
    const ns = res.body.data.ns;
    const columns = res.body.data.columns || {};
    return { exists, ns, columns, error };
  };

  return fromFuncs({
    events$,
    getType: getType,
    getCells,
    getColumns,
  });
}

/**
 * Constructs a sheet-data-fetcher from an HTTP host/client.
 */
function fromFuncs(args: {
  events$?: Subject<E>;
  getType: GetType;
  getCells: GetCells;
  getColumns: GetColumns;
}): F {
  const events$ = args.events$ || new Subject<E>();
  const { getType, getCells, getColumns } = args;
  return { events$, getType, getCells, getColumns };
}

export const fetcher = {
  fromClient,
  fromFuncs,
};

/**
 * [Internal]
 */

function asError(error: t.IHttpError | undefined, getMessage: (message: string) => string) {
  if (!error) {
    return undefined;
  } else {
    const message = getMessage(error.message);
    return { ...error, message };
  }
}
