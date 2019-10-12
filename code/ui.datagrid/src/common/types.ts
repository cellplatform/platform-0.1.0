import * as t from '../types';
export { KeyBindings } from '@platform/react/lib/types';
export * from '@platform/cell.types';

export { Json } from '@platform/types';

export * from '../types';

/**
 * [Internal]
 */
export type FireGridEvent = (e: t.GridEvent) => void;

export type FireGridKeyboardCommandEvent = <P = {}>(
  command: t.GridCommand,
  e: t.IGridKeydown,
  props?: P,
) => void;
