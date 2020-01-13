import * as t from '../types';

export * from '../types';
export type FireEvent = (e: t.CmdAppEvent) => void;
export type Exit = (code: number) => void;
