import { t } from '../../common';

/**
 * API for firing global events.
 */
export function Fire(bus: t.EventBus<any>): t.CodeEditorEventsFire {
  const fire = (e: t.CodeEditorSingletonEvent) => bus.fire(e);
  return {
    libs: {
      clear() {
        fire({ type: 'CodeEditor/libs:clear', payload: {} });
      },
    },
  };
}
