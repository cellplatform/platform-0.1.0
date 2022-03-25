export type CmdTextboxTheme = 'Dark' | 'Light';

export type CmdTextboxActionEvent = { text: string };
export type CmdTextboxActionEventHandler = (e: CmdTextboxActionEvent) => void;

export type CmdTextboxChangeEvent = { from: string; to: string };
export type CmdTextboxChangeEventHandler = (e: CmdTextboxChangeEvent) => void;
