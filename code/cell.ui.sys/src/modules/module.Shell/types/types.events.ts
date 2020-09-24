import { t } from '../common';

/**
 * [Events]
 */
export type ShellEvent = IShellFocusEvent;

export type IShellFocusEvent = {
  type: 'Shell/focus';
  payload: IShellFocus;
};
export type IShellFocus = {
  region: t.ShellRegion;
};
