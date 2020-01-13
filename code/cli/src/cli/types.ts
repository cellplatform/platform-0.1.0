import { Observable } from 'rxjs';
import { Arguments, Argv } from 'yargs';

import * as t from '../types';

export type ICmdArgv<T extends object = {}> = { [key in keyof Arguments<T>]: Arguments<T>[key] };

export type ICmdApp = {
  program: Argv<{}>;
  command: Argv<{}>['command'];
  option: Argv<{}>['option'];
  task: t.AddTask;
  skip: t.AddTask;
  exit(code: number): void;
  run(): void;
  events$: Observable<CmdAppEvent>;
};

/**
 * EVENTS
 */
export type CmdAppEvent = ICmdAppExitEvent | ICmdAppShowHelpEvent;

export type ICmdAppExitEvent = { type: 'CLI/exit'; payload: ICmdAppExit };
export type ICmdAppExit = { ok: boolean; code: number };

export type ICmdAppShowHelpEvent = { type: 'CLI/showHelp'; payload: ICmdAppShowHelp };
export type ICmdAppShowHelp = {
  stage: 'BEFORE' | 'AFTER';
  argv: ICmdArgv<{}>;
};
