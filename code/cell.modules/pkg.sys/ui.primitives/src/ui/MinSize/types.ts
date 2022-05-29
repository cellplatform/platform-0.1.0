import { DomRect } from '../../common/types';

export type MinSizeHideStrategy = 'unmount' | 'css:opacity' | 'css:display';

export type MinSizeRenderWarning = (e: MinSizeStatus) => React.ReactNode;

export type MinSizeStatus = { size: DomRect; is: MinSizeFlags };
export type MinSizeResizeEventHandler = (e: MinSizeStatus) => void;
export type MinSizeFlags = {
  ok: boolean;
  tooSmall: boolean | null;
  tooNarrow: boolean | null;
  tooShort: boolean | null;
};
