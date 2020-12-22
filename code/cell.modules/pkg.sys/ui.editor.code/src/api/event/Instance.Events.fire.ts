import { t, slug } from '../../common';

/**
 * API for firing change events.
 */
export function Fire(bus: t.EventBus<any>, instance: string): t.CodeEditorInstanceEventsFire {
  const fire = (e: t.CodeEditorInstanceEvent) => bus.fire(e);

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

    action(action) {
      const tx = slug();
      fire({
        type: 'CodeEditor/action:run',
        payload: { instance, action, tx },
      });
      return tx;
    },
  };
}
