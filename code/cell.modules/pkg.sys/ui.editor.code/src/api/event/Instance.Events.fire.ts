import { t, slug, WaitForResponse } from '../../common';

/**
 * API for firing change events.
 */
export function Fire(bus: t.EventBus<any>, instance: string): t.CodeEditorInstanceEventsFire {
  const $ = bus.event$;
  const fire = (e: t.CodeEditorInstanceEvent) => bus.fire(e);

  const WaitFor = {
    Action: WaitForResponse<t.ICodeEditorActionCompleteEvent>($, 'CodeEditor/action:complete'),
  };

  return {
    instance,

    focus() {
      fire({
        type: 'CodeEditor/change:focus',
        payload: { instance },
      });
    },

    select(selection, options = {}) {
      const { focus } = options;
      fire({
        type: 'CodeEditor/change:selection',
        payload: { instance, selection, focus },
      });
    },

    text(text) {
      fire({
        type: 'CodeEditor/change:text',
        payload: { instance, text },
      });
    },

    async action(action) {
      const tx = slug();
      const wait = WaitFor.Action.response(tx);
      fire({
        type: 'CodeEditor/action:run',
        payload: { instance, action, tx },
      });
      return (await wait).payload;
    },
  };
}
