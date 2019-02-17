import { Observable } from 'rxjs';

/**
 * Commands
 */
export type IResult = {
  ok: boolean;
  code: number;
  error?: Error;
};
export type IResultInfo = IResult & {
  info: string[];
  errors: string[];
};

/**
 * A single task.
 */
export type ITask<T = any> = {
  title: string;
  task: () => Promise<T> | T;
};

/**
 * A named shell command.
 */
export type ICommand = {
  title: string;
  cmd: string;
};

/**
 * A line of information emitted from a command.
 */
export type ICommandInfo = {
  type: 'stdout' | 'stderr';
  text: string;
};

/**
 * The response from running a command providing a await-able
 * promise as well as observables delivering the [stdio] stream.
 */
export type ICommandPromise = Promise<IResultInfo> &
  IResultInfo & {
    isComplete: boolean;
    output$: Observable<ICommandInfo>;
    stdout$: Observable<string>; // Includes ANSI colors.
    stderr$: Observable<string>; // Includes ANSI colors.
    stdout: string[]; // Includes ANSI colors - see [info] for values with no colors.
    stderr: string[]; // Includes ANSI colors - see [info] for values with no colors.
    dir: string; // The `cwd` (current working directory) the script executed in.
  };

/**
 * Log
 */
export type ILog = { info: LogValue; warn: LogValue; error: LogValue };
export type LogValue = (...value: any) => void;

/**
 * Command list execution.
 */

export type ICommandListExecutionResponse = IResult & {
  ok: boolean;
  results: IListCommandResult[];
  errors: ICommandErrors;
  dir: string;
};

export type IListCommandResult = {
  ok: boolean;
  index: number;
  cmd: string;
  data: IResultInfo;
};

export type ICommandErrors = ICommandError[] & {
  log: (args: { log?: ILog }) => void;
};

export type ICommandError = {
  index: number;
  cmd: string;
  errors: string[];
};
