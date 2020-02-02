import { t, cell, models, http, fs, Schema, util } from '../common';

/**
 * Executes calculations on a namespace.
 */
export function calc(args: { host: string; ns: t.IDbModelNs; cells?: t.IMap<t.ICellData> }) {
  const { ns, host } = args;
  const TMP = host.startsWith('localhost') ? fs.resolve('tmp') : fs.resolve('/tmp');

  /**
   * TODO 🐷
   * - lookup functions from imports (TBD, external namespaces)
   */
  const getFunc: t.GetFunc = async args => {
    // TEMP 🐷

    console.log('getFunc', args);

    if (args.namespace === 'local' || (args.namespace === 'sys' && args.name === 'SUM')) {
      const cells = await models.ns.getChildCells({ model: ns });

      // Look up a local cell with the func definition.
      type FuncProp = { name: string; link: string };
      type FuncLink = { key: string; link: string; uri: string };
      let func: FuncLink | undefined;
      Object.keys(cells).forEach(key => {
        const cell = cells[key] || {};
        const cellLinks = cell.links || {};
        const props = (cell.props || {}) as { func?: FuncProp };
        if (props.func && props.func.name === args.name) {
          const link = props.func.link;
          const uri = cellLinks[link];
          func = { key, link, uri };
        }
      });

      // Download the file.
      if (func && Schema.uri.is.file(func.uri)) {
        console.log('func.uri', func.uri);

        const url = util.urls(host).file(func.uri).download;
        const saveTo = `${TMP}/cache/${func.uri.replace(/\:/g, '-')}`;

        const res = await http.get(url);
        if (res.body) {
          await fs.stream.save(saveTo, res.body);
        }

        // Load the WASM.
        const source = await fs.readFile(saveTo);
        const typedArray = new Uint8Array(source);
        const env = {
          memoryBase: 0,
          tableBase: 0,
          memory: new WebAssembly.Memory({ initial: 256 }),
          table: new WebAssembly.Table({ initial: 0, element: 'anyfunc' }),
        };

        const wasm = await WebAssembly.instantiate(typedArray, { env });
        const lib = wasm.instance.exports as any;

        // TEMP
        const invoker: t.FuncInvoker = args => {
          const p1 = args.params[0] || 0;
          const p2 = args.params[1] || 0;
          return lib.add(p1, p2);
        };
        return invoker;
      }
    }

    // Not found.
    return undefined;
  };

  /**
   * Cells lookup.
   */
  let cells: t.IMap<t.ICellData> | undefined;
  const getCells: t.GetCells = async () => {
    cells = cells || (await models.ns.getChildCells({ model: ns }));
    return { ...cells, ...(args.cells || {}) };
  };

  /**
   * References table manager.
   */
  const refsTable = cell.coord.refs.table({
    getKeys: async () => Object.keys(await getCells()),
    getValue: async key => {
      const cell = (await getCells())[key];
      return cell && typeof cell.value === 'string' ? cell.value : undefined;
    },
  });
  const table = cell.func.table({ getCells, getFunc, refsTable });

  /**
   * Calculate a set of changes.
   */
  const changes = async (options: { range?: string } = {}) => {
    const { range } = options;
    const cells = args.cells || (await getCells());

    // Determine the set of keys to evalutate.
    let keys: string[] | undefined;
    keys = Object.keys(cells || {});
    if (typeof range === 'string') {
      const ranges = cell.coord.range.union(range.split(','));
      keys = keys.filter(key => ranges.contains(key));
    }

    // Calculate the changes.
    return table.calculate({ cells: keys });
  };

  // Finish up.
  return { changes, table };
}
