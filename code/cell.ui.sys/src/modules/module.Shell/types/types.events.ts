import { t } from '../common';

/**
 * [Events]
 */
export type ShellEvent = IShellFocusEvent | IShellWindowResizeEvent;

/**
 * Fired when focus focus is to be assigned to a region within the [Shell].
 */
export type IShellFocusEvent = {
  type: 'Shell/focus';
  payload: IShellFocus;
};
export type IShellFocus = { region: t.ShellRegion };

/**
 * Fires when the [Shell] window resizes.
 */
export type IShellWindowResizeEvent = {
  type: 'Shell/window/resize';
  payload: IShellWindowResize;
};
export type IShellWindowResize = { width: number; height: number };
