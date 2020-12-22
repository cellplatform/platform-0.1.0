import { t } from '../../common';

/**
 * API for firing global events.
 */
export function Fire(bus: t.EventBus<any>): t.CodeEditorSingletonEventsFire {
  const fire = (e: t.CodeEditorSingletonEvent) => bus.fire(e);
  return {};
}
