import '../config';
import { t, Client, fs } from '../common';

type TypeDefs = { [key: string]: t.ITypeDefPayload };

const NS = {
  APP: 'ns:sys.app.type',
  WINDOW: 'ns:sys.window.type',
};

const DEFS: TypeDefs = {
  [NS.APP]: {
    ns: { type: { typename: 'CellApp' } },
    columns: {
      A: { props: { prop: { name: 'title', type: 'string', default: 'CellOS' } } },
      B: { props: { prop: { name: 'windows', type: 'ns:sys.type.window[]', target: 'ref' } } },
    },
  },
  [NS.WINDOW]: {
    ns: { type: { typename: 'CellWindow' } },
    columns: {
      A: { props: { prop: { name: 'title', type: 'string' } } },
    },
  },
};

/**
 * Write the application types.
 */
export const writeTypes = async (host: string, options: { save?: boolean } = {}) => {
  const client = Client.http(host);

  const write = async (ns: string) => {
    if (!DEFS[ns]) {
      throw new Error(`namespace "${ns}" is not defined.`);
    }
    await client.ns(ns).write(DEFS[ns]);
  };

  await write(NS.APP);
  await write(NS.WINDOW);

  if (options.save) {
    const type = Client.type({ client });
    const ts = await type.typescript(NS.APP);
    await ts.save(fs, fs.resolve('src/types.d.ts'));
  }

  return { client: client };
};
