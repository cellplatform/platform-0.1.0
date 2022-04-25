export type CmdTextboxTheme = 'Dark' | 'Light';

export type CmdTextboxActionKind = 'Key:Enter';
export type CmdTextboxActionEvent = { text: string; kind: CmdTextboxActionKind };
export type CmdTextboxActionEventHandler = (e: CmdTextboxActionEvent) => void;

export type CmdTextboxChangeEvent = { from: string; to: string };
export type CmdTextboxChangeEventHandler = (e: CmdTextboxChangeEvent) => void;
