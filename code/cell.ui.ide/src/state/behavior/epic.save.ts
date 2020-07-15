import { debounceTime } from 'rxjs/operators';

import { t, time } from '../../common';
import { CodeSchema } from '../../schema';

/**
 * TODO 🐷
 * - store type-defs in stable place.
 * - store data in stable place.
 */
import { namespaces } from '../../test/stub'; // TEMP 🐷

// const typeUri = 'ns:ckcmytlij000g456c8iyv8vjq';
const dataUri = 'ns:ckcmyowv5000e456cayhy1omy';

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
      isInitialized = true;
      await ensureTypeDefs();
      await ensureData({ ns: dataUri, implements: namespaces.Code });
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

  /**
   * Listen for changes to the code editor.
   */
  store
    .on<t.IIdeEditorContentChangeEvent>('APP:IDE/editor/contentChange')
    .pipe(debounceTime(300))
    .subscribe(async (e) => {
      await init();

      const sheet = await client.sheet<t.TypeIndex>(dataUri);


      const data = sheet.data('Code');
      const row = data.row(0); // TEMP 🐷

      row.props.text = store.state.text;
      await time.wait(10);
      console.log('-------------------------------------------');
      console.log('changes', sheet.changes);
      console.log('text', sheet.changes.cells);
    });
}
