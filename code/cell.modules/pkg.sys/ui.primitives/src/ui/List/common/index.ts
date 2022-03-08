import * as t from './types';
import { rx, slug } from '../../common';

export { t };
export * from '../../common';
export * from './constants';
export * from './Is';
export { useUIEvents, UIEvents } from '../../../hooks/UIEvents';

/**
 * Create a dummy EVENT {bus/instance} object.
 */
export function eventDummy(): t.ListEventArgs {
  return {
    bus: rx.bus(),
    instance: `list.dummy.${slug()}`,
  };
}
