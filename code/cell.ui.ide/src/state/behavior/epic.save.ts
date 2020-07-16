import { debounceTime, filter } from 'rxjs/operators';

import { t, time, Uri } from '../../common';
import { CodeSchema } from '../../schema';

/**
 * TODO 🐷
 * - store type-defs in stable place.
 * - store data in stable place.
 */
import { namespaces } from '../../test/stub'; // TEMP 🐷

// const typeUri = 'ns:ckcmytlij000g456c8iyv8vjq';

/**
 * Async behavior controllers.
 */
export function init(args: { ctx: t.IAppContext; store: t.IAppStore }) {
  const { ctx, store } = args;
  const { client } = ctx;
  const http = client.http;

  let isInitialized = false;

  const init = async () => {
    if (!isInitialized) {
      const ns = Uri.toNs(store.state.uri).toString();
      isInitialized = true;
      await ensureTypeDefs();
      await ensureData({ ns, implements: namespaces.CodeFile });
    }
  };

  const ensureTypeDefs = async () => {
    const schema = CodeSchema.declare({ namespaces });
    const res = await schema.def.write(http);
    if (!res.ok) {
      const messages = res.errors.map((e) => e.error.message).join(',');
      throw new Error(`Failed while save type-defs: ${messages}`);
    }
  };

  const ensureData = async (args: { ns: string; implements: string }) => {
    const { ns } = args;
    if (!(await http.ns(ns).exists())) {
      const res = await http.ns(ns).write({ ns: { type: { implements: args.implements } } });
      if (!res.ok || res.error) {
        throw new Error(`Failed to create data sheet at [${ns}]. ${res.error?.message || ''}`);
      }
    }
  };

  const loadSheet = async () => {
    const uri = Uri.row(store.state.uri);
    const index = Uri.toRowIndex(uri);

    const sheet = await client.sheet<t.TypeIndex>(uri.ns);
    const data = await sheet.data('CodeFile').load();
    const row = data.row(index);

    return { sheet, index, row };
  };

  /**
   * Load initial text when URI changes.
   */
  store.changed$.pipe(filter((e) => e.type === 'APP:IDE/uri')).subscribe(async (e) => {
    await init();
    const { row } = await loadSheet();
    const text = row.props.text;
    store.dispatch({ type: 'APP:IDE/text', payload: { text } });
  });

  /**
   * Listen for changes to the code editor.
   */
  store
    .on<t.IIdeEditorContentChangeEvent>('APP:IDE/editor/contentChange')
    .pipe(debounceTime(800))
    .subscribe(async (e) => {
      // await init();
      const state = store.state;
      const { sheet, row } = await loadSheet();

      const props = row.props;

      props.text = state.text;
      props.language = state.language;
      // row.props.code
      // console.log('row.props.code', row.props.text);

      await time.wait(10);
      // await ctx.sheetChanged(sheet.changes);

      const res = await client.saveChanges({ sheet });
      console.log('saved', res);
    });
}
