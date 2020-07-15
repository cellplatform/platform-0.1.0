import { TypeSystem, t } from '../common';
import { AppSchema } from '../AppSchema';

// NB: Fixed namespaces passed in to avoid re-generating new file on each test-run.
const namespaces: t.IAppNamespaces = {
  App: 'ns:ckcck1w4m0003goetfzhn5dgc',
  AppWindow: 'ns:ckcck1w4m0004goet0a8oavc9',
  AppData: 'ns:ckcck1w4m0005goet1hqude43',
};

const defs = AppSchema.declare({ namespaces }).def.toObject();

const creator = (args: { implements: string }) => {
  const instance = (ns: string, cells?: t.ICellMap) =>
    TypeSystem.fetcher.stub.instance({
      instance: ns,
      implements: args.implements,
      defs,
      cells,
    });
  return {
    fetch: instance,
    async sheet(ns: string, cells?: t.ICellMap) {
      const fetch = await instance(ns, cells);
      return TypeSystem.Sheet.load<t.AppTypeIndex>({ ns, fetch });
    },
  };
};

export const stub = {
  namespaces,
  App: creator({ implements: namespaces.App }),
  AppWindow: creator({ implements: namespaces.AppWindow }),
  AppData: creator({ implements: namespaces.AppData }),
};
