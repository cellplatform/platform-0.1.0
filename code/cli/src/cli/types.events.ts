import * as t from '../common/types';

/**
 * EVENTS
 */
export type CmdAppEvent =
  | ICmdAppExitEvent
  | ICmdAppShowHelpBeforeEvent
  | ICmdAppShowHelpAfterEvent
  | CmdAppKeyboardEvent;

export type ICmdAppExitEvent = { type: 'CLI/exit'; payload: ICmdAppExit };
export type ICmdAppExit = { ok: boolean; code: number };

export type ICmdAppShowHelpBeforeEvent = { type: 'CLI/showHelp/before'; payload: ICmdAppShowHelp };
export type ICmdAppShowHelpAfterEvent = { type: 'CLI/showHelp/after'; payload: ICmdAppShowHelp };
export type ICmdAppShowHelp = { argv: t.ICmdArgv<{}> };

/**
 * Keyboard
 */
export type CmdAppKeyboardEvent = ICmdAppKeypressEvent | ICmdAppKeyboardStartedEvent;

export type ICmdAppKeyboardStartedEvent = {
  type: 'CLI/keyboard/started';
  payload: ICmdAppKeyboardStarted;
};
export type ICmdAppKeyboardStarted = {};

export type ICmdAppKeypressEvent = {
  type: 'CLI/keyboard/keypress';
  payload: ICmdAppKeypress;
};
export type ICmdAppKeypress = {
  sequence: string;
  key: string;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
};
