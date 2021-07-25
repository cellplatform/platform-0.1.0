import { DomRect } from '../../common/types';

export type MinSizeHideStrategy = 'unrender' | 'css:opacity';

export type MinSizeResizeEvent = { size: DomRect; is: MinSizeFlags };
export type MinSizeResizeEventHandler = (e: MinSizeResizeEvent) => void;
export type MinSizeFlags = {
  ok: boolean;
  tooSmall: boolean | null;
  tooNarrow: boolean | null;
  tooShort: boolean | null;
};
