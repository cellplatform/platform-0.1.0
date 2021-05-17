import { slug, t, WaitForResponse } from '../../common';

/**
 * API for firing global events.
 */
export function Fire(bus: t.EventBus<any>): t.CodeEditorEventsFire {
  const $ = bus.$;
  const fire = (e: t.CodeEditorSingletonEvent) => bus.fire(e);

  const WaitFor = {
    Load: WaitForResponse<t.ICodeEditorLibsLoadedEvent>($, 'CodeEditor/libs:loaded'),
  };

  const libs: t.CodeEditorEventsFire['libs'] = {
    /**
     * Remove all type libraries.
     */
    clear() {
      fire({ type: 'CodeEditor/libs:clear', payload: {} });
    },

    /**
     * Load type libraries at the given URL.
     */
    async load(url) {
      const tx = slug();
      const wait = WaitFor.Load.response(tx);
      fire({ type: 'CodeEditor/libs:load', payload: { url, tx } });
      return (await wait).payload;
    },
  };

  return { libs };
}
