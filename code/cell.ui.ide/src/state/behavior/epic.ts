import { filter } from 'rxjs/operators';
import { t } from '../../common';

/**
 * Async behavior controllers.
 */
export function init(args: { ctx: t.IAppContext; store: t.IAppStore }) {
  const { ctx, store } = args;
  const { client } = ctx;
  const http = client.http;

  /**
   * Load the IDE.
   */
  store
    .on<t.IIdeLoadEvent>('APP:IDE/load')
    .pipe()
    .subscribe((e) => {
      const { uri } = e.payload;
      store.dispatch({ type: 'APP:IDE/uri', payload: { uri } });
    });

  /**
   * Ensure the types are pulled when the URI changes.
   */
  store.changed$.pipe(filter((e) => e.type === 'APP:IDE/uri')).subscribe((e) => {
    const uri = e.to.uri;
    store.dispatch({ type: 'APP:IDE/types/pull', payload: { uri } });
  });

  /**
   * Pull types from the network.
   */
  store
    .on<t.IIdePullTypesEvent>('APP:IDE/types/pull')
    .pipe(filter((e) => Boolean(e.payload.uri)))
    .subscribe(async (e) => {
      const ns = http.ns(e.payload.uri);
      const info = await ns.read();

      const typeNs = info.body.data.ns.props?.type?.implements || '';
      const defs = await client.defs(typeNs);
      const typescript = await client.typescript(typeNs, { exports: false, imports: false });
      const ts = typescript.toString().replace(/t\./g, '');

      store.dispatch({ type: 'APP:IDE/types/data', payload: { defs, ts } });
    });
}
