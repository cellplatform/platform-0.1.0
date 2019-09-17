import * as t from '../types';

export * from '../types';
export { KeyBindings } from '@platform/react/lib/types';

/**
 * [INTERNAL]
 */
export type FireGridEvent = (e: t.GridEvent) => void;

export type FireGridKeyboardCommandEvent = <P = {}>(
  command: t.GridCommand,
  e: t.IGridKeydown,
  props?: P,
) => void;
