import { Client, fs, t } from '../common';
import { NS } from './constants';

type TypeDefs = { [key: string]: t.ITypeDefPayload };

export const DEFS: TypeDefs = {
  [NS.TYPE.APP]: {
    ns: { type: { typename: 'CellApp' } },
    columns: {
      A: { props: { prop: { name: 'title', type: 'string', default: 'CellOS' } } },
      B: { props: { prop: { name: 'windows', type: 'ns:sys.window.type[]', target: 'ref' } } },
    },
  },
  [NS.TYPE.WINDOW]: {
    ns: { type: { typename: 'CellAppWindow' } },
    columns: {
      A: { props: { prop: { name: 'title', type: 'string', default: 'Untitled' } } },
      B: { props: { prop: { name: 'width', type: 'number', default: 1200 } } },
      C: { props: { prop: { name: 'height', type: 'number', default: 800 } } },
    },
  },
};

/**
 * Write the application types.
 */
export async function writeTypeDefs(host: string, options: { save?: boolean } = {}) {
  const http = Client.http(host);

  const write = async (ns: string) => {
    if (!DEFS[ns]) {
      throw new Error(`namespace "${ns}" is not defined.`);
    }
    await http.ns(ns).write(DEFS[ns]);
  };

  await write(NS.TYPE.APP);
  await write(NS.TYPE.WINDOW);

  if (options.save) {
    const type = Client.type({ http });
    const ts = await type.typescript(NS.TYPE.APP);
    const dir = fs.resolve('src');
    await ts.save(fs, dir, { filename: 'types.g' });
  }
}
