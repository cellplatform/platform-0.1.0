import { ERROR, HttpClient, t } from '../common';

/**
 * Constructs a sheet-data-fetcher from an HTTP host/client.
 */
function fromClient(args: { client: string | t.IHttpClient }): t.ISheetFetcher {
  const client = typeof args.client === 'string' ? HttpClient.create(args.client) : args.client;

  const getType: t.FetchSheetType = async args => {
    const res = await client.ns(args.ns).read();
    const exists = res.body.exists;
    let error: t.IHttpError | undefined;

    if (!exists) {
      const message = `The namespace [${args.ns}] does not exist.`;
      error = { status: 404, message, type: ERROR.HTTP.NOT_FOUND };
    }

    const type = res.body.data.ns.props?.type as t.INsType;
    if (!type) {
      const message = `The namespace [${args.ns}] does not contain a type reference.`;
      error = { status: 422, message, type: ERROR.HTTP.NOT_FOUND };
    }

    return { exists, type, error };
  };

  const getColumns: t.FetchSheetColumns = async args => {
    const res = await client.ns(args.ns).read({ columns: true });
    const error = formatError(
      res.error,
      msg => `Failed to retrieve type information from namespace [${args.ns}]. ${msg}`,
    );
    const columns = res.body.data.columns || {};
    return { columns, error };
  };

  const getCells: t.FetchSheetCells = async args => {
    const { ns, query } = args;
    const res = await client.ns(ns).read({ cells: query, total: 'rows' });
    const error = formatError(
      res.error,
      msg => `Failed to retrieve cells "${query}" within namespace [${ns}]. ${msg}`,
    );

    const cells = res.body.data.cells || {};
    const total = res.body.data.total || {};
    const rows = total.rows || 0;

    return { cells, error, total: { rows } };
  };

  return fromFuncs({
    getType,
    getColumns,
    getCells,
  });
}

/**
 * Constructs a sheet-data-fetcher from an HTTP host/client.
 */
function fromFuncs(args: {
  getType: t.FetchSheetType;
  getColumns: t.FetchSheetColumns;
  getCells: t.FetchSheetCells;
}): t.ISheetFetcher {
  const { getType, getCells, getColumns } = args;
  return { getType, getCells, getColumns };
}

export const fetcher = {
  fromClient,
  fromFuncs,
};

/**
 * [Internal]
 */

function formatError(error: t.IHttpError | undefined, getMessage: (message: string) => string) {
  if (!error) {
    return undefined;
  } else {
    const message = getMessage(error.message);
    return { ...error, message };
  }
}
