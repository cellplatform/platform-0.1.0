import { t } from '../common';

/**
 * API for firing change events.
 */
export function Fire(bus: t.CodeEditorEventBus, instance: string): t.CodeEditorEventsFire {
  return {
    instance,

    focus() {
      bus.fire({
        type: 'CodeEditor/change:focus',
        payload: { instance },
      });
    },

    select(selection, options = {}) {
      const { focus } = options;
      bus.fire({
        type: 'CodeEditor/change:selection',
        payload: { instance, selection, focus },
      });
    },

    text(text) {
      bus.fire({
        type: 'CodeEditor/change:text',
        payload: { instance, text },
      });
    },
  };
}
