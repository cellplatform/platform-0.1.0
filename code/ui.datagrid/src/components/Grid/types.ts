import { EditorEvent } from '../Editor/types';

/**
 * [Events]
 */
export type GridEvent = EditorEvent | IGridKeydownEvent;

export type IGridKeydownEvent = {
  type: 'GRID/keydown';
  payload: IGridKeydown;
};
export type IGridKeydown = {
  key: KeyboardEvent['key'];
  event: KeyboardEvent;
  isEnter: boolean;
  isEscape: boolean;
  cancel: () => void;
};
