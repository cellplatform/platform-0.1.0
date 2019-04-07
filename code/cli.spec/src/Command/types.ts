import { ICommandArgs } from '../Argv/types';
import { Observable } from 'rxjs';
export { ICommandArgs };
import { ICommandParam } from '../CommandParam/types';

/**
 * Represents a single [command] which is a named unit of
 * functionality that can optionally take parameter input.
 *
 * Generics:
 *  - `P` stands for `props`
 *  - `A` stands for `arguments`
 */
export type ICommand<P extends object = any, A extends object = any> = {
  id: number;
  name: string;
  params: ICommandParam[];
  children: ICommand[];
  handler?: CommandHandler<P, A>;
  invoke: InvokeCommand<P, A>;
  events$: Observable<CommandInvokeEvent>;
  tree: ITreeMethods<ICommand<P, A>>;
};

/**
 * Tree helpers
 */
export type ITreeMethods<T extends ICommand = ICommand> = {
  count: number;
  walk: (fn: CommandTreeVisitor<T>) => ICommandTreeVisitorResult;
  find: (fn: CommandTreeFilter<T>) => T | undefined;
  parent: (root: T) => T | undefined;
  toPath: (target: number | string | T) => T[];
  fromPath: (path: Array<string | number | boolean>) => T | undefined;
};
export type ICommandTreeVisitorArgs<T extends ICommand> = {
  command: T;
  stop: () => void;
};
export type CommandTreeVisitor<T extends ICommand> = (e: ICommandTreeVisitorArgs<T>) => void;
export type ICommandTreeVisitorResult = { stopped: boolean };
export type CommandTreeFilter<T extends ICommand> = (command: T) => boolean;

/**
 * The handler that is invoked for a command.
 * Generics:
 *  - `P` stands for `props`
 *  - `A` stands for `arguments`
 */
export type CommandHandler<P extends object = any, A extends object = any> = (
  e: ICommandHandlerArgs<P, A>,
) => any | Promise<any>;

/**
 * Arguments passed to a command handler.
 * Generics:
 *  - `P` stands for `props`
 *  - `A` stands for `arguments`
 */
export type ICommandHandlerArgs<P extends object = any, A extends object = any> = {
  args: ICommandArgs<A>;
  props: P;
  get<K extends keyof P>(key: K): P[K];
  set<K extends keyof P>(key: K, value: P[K]): ICommandHandlerArgs<P, A>;
};

/**
 * [Invoke]
 */
export type InvokeCommand<P extends object = any, A extends object = any> = <R = any>(
  options: IInvokeCommandArgs<P, A>,
) => IInvokedCommandPromise<P, A, R>;
export type IInvokeCommandArgs<P extends object = any, A extends object = any> = {
  props: P;
  args?: string | ICommandArgs<A>;
  timeout?: number;
};

/**
 * The response from [invoking] of the handler.
 */
export type IInvokedCommandPromise<P extends object, A extends object, R> = Promise<
  IInvokedCommandResponse<P, A, R>
> &
  IInvokedCommandResponse<P, A, R>;
export type IInvokedCommandResponse<P extends object, A extends object, R> = {
  events$: Observable<CommandInvokeEvent>;
  complete$: Observable<{}>;
  isComplete: boolean;
  isTimedOut: boolean;
  timeout: number;
  props: P;
  args: ICommandArgs<A>;
  result?: R;
  error?: Error;
};

/**
 * [Events]
 */
export type CommandEvent = CommandInvokeEvent;

export type CommandInvokeEvent =
  | ICommandInvokeBeforeEvent
  | ICommandInvokeAfterEvent
  | ICommandInvokeSetEvent;

export type ICommandInvokeBeforeEvent<P extends object = any, A extends object = any> = {
  type: 'COMMAND/invoke/before';
  payload: { command: ICommand<P, A>; invokeId: string; props: P };
};

export type ICommandInvokeSetEvent<P extends object = any, A extends object = any> = {
  type: 'COMMAND/invoke/set';
  payload: { command: ICommand<P, A>; invokeId: string; key: keyof P; value: P[keyof P]; props: P };
};

export type ICommandInvokeAfterEvent<P extends object = any, A extends object = any> = {
  type: 'COMMAND/invoke/after';
  payload: { command: ICommand<P, A>; invokeId: string; props: P; error?: Error };
};
