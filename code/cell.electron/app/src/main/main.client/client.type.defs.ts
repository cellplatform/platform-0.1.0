import { Client, fs, t, constants } from '../common';

const SYS = constants.SYS;
const NS = SYS.NS;

type TypeDefs = { [key: string]: t.ITypeDefPayload };

export const DEFS: TypeDefs = {
  [NS.TYPE.APP]: {
    ns: { type: { typename: 'CellApp' } },
    columns: {
      A: { props: { prop: { name: 'title', type: 'string', default: 'CellOS' } } },
      B: {
        props: { prop: { name: 'windowDefs', type: `${NS.TYPE.WINDOW_DEF}[]`, target: 'ref' } },
      },
      C: { props: { prop: { name: 'windows', type: `${NS.TYPE.WINDOW}[]`, target: 'ref' } } },
    },
  },
  [NS.TYPE.WINDOW_DEF]: {
    ns: { type: { typename: 'CellAppWindowDef' } },
    columns: {
      A: { props: { prop: { name: 'kind', type: 'string', default: '' } } },
      B: { props: { prop: { name: 'width', type: 'number', default: 1200 } } },
      C: { props: { prop: { name: 'height', type: 'number', default: 800 } } },
    },
  },
  [NS.TYPE.WINDOW]: {
    ns: { type: { typename: 'CellAppWindow' } },
    columns: {
      A: { props: { prop: { name: 'id', type: 'string', default: '' } } },
      B: { props: { prop: { name: 'kind', type: 'string', default: '' } } },
      C: { props: { prop: { name: 'title', type: 'string', default: 'Untitled' } } },
      D: { props: { prop: { name: 'width', type: 'number', default: -1 } } },
      E: { props: { prop: { name: 'height', type: 'number', default: -1 } } },
      F: { props: { prop: { name: 'x', type: 'number' } } },
      G: { props: { prop: { name: 'y', type: 'number' } } },
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
  await write(NS.TYPE.WINDOW_DEF);
  await write(NS.TYPE.WINDOW);

  if (options.save) {
    const type = Client.type({ http });
    const ts = await type.typescript(NS.TYPE.APP);
    const dir = fs.resolve('src');
    await ts.save(fs, dir, { filename: 'types.g' });
  }
}
