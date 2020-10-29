import { t } from '../common';

/**
 * [Events]
 */
export type ShellEvent = IShellFocusEvent | IShellWindowResizeEvent | IShellAddEvent;

/**
 * Fired when focus is to be assigned to a region within the [Shell].
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

/**
 * Fires when a module is to be registered within the shell.
 */
export type IShellAddEvent = {
  type: 'Shell/add';
  payload: IShellAdd;
};
export type IShellAdd = { shell: string; module: string; parent?: string };
