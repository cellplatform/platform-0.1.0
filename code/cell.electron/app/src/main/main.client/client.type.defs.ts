import { Client, fs, t, constants } from '../common';

const SYS = constants.SYS;
const NS = SYS.NS;

type TypeDefs = { [key: string]: t.ITypeDefPayload };

export const DEFS: TypeDefs = {
  [NS.TYPE.APP]: {
    columns: {
      A: { props: { def: { prop: 'CellApp.title', type: 'string', default: 'CellOS' } } },
      B: {
        props: {
          def: { prop: 'CellApp.windowDefs', type: `${NS.TYPE.WINDOW_DEF}[]`, target: 'ref' },
        },
      },
      C: {
        props: { def: { prop: 'CellApp.windows', type: `${NS.TYPE.WINDOW}[]`, target: 'ref' } },
      },
    },
  },
  [NS.TYPE.WINDOW_DEF]: {
    columns: {
      A: { props: { def: { prop: 'CellAppWindowDef.kind', type: 'string', default: '' } } },
      B: { props: { def: { prop: 'CellAppWindowDef.width', type: 'number', default: 1200 } } },
      C: { props: { def: { prop: 'CellAppWindowDef.height', type: 'number', default: 800 } } },
    },
  },
  [NS.TYPE.WINDOW]: {
    columns: {
      A: { props: { def: { prop: 'CellAppWindow.id', type: 'string', default: '' } } },
      B: { props: { def: { prop: 'CellAppWindow.kind', type: 'string', default: '' } } },
      C: { props: { def: { prop: 'CellAppWindow.title', type: 'string', default: 'Untitled' } } },
      D: { props: { def: { prop: 'CellAppWindow.width', type: 'number', default: -1 } } },
      E: { props: { def: { prop: 'CellAppWindow.height', type: 'number', default: -1 } } },
      F: { props: { def: { prop: 'CellAppWindow.x', type: 'number' } } },
      G: { props: { def: { prop: 'CellAppWindow.y', type: 'number' } } },
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
    await ts.save(fs, fs.resolve('src/types.g'));
  }
}
