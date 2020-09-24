import { t } from '../common';

export const is = {
  /**
   * Determine if the given event is a [Module] system event.
   */
  moduleEvent(event: t.Event) {
    return event.type.startsWith('Module/');
  },
};
