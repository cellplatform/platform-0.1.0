import { ICommandArgs } from '../Argv/types';
import { Observable } from 'rxjs';
export { ICommandArgs };

/**
 * Represents a single [command] which is a named unit of
 * functionality that can optionally take parameter input.
 *
 * Generics:
 *  - `P` stands for `props`
 *  - `O` stands for argument `options`
 */
export type ICommand<P extends object = any, A extends object = any> = {
  events$: Observable<CommandInvokeEvent>;
  title: string;
  children: ICommand[];
  handler: CommandHandler<P, A>;
};

/**
 * Represents an API for building a tree of commands.
 */
export type ICommandBuilder<P extends object = any, A extends object = any> = ICommand<P, A> &
  ICommandBuilderAdd<P, A> & {
    length: number;
    children: ICommandBuilder[];

    as<P1 extends object, A1 extends object>(
      fn: (e: ICommandBuilder<P1, A1>) => void,
    ): ICommandBuilder<P, A>;
    childrenAs<P1 extends object, A1 extends object>(): Array<ICommandBuilder<P1, A1>>;

    clone(options?: { deep?: boolean }): ICommandBuilder<P, A>;
    toObject(): ICommand<P, A>;
    invoke<R = any>(options: {
      props: P;
      args?: string | ICommandArgs<A>;
    }): ICommandInvokePromise<P, A, R>;
  };

export type ICommandBuilderAdd<P extends object = any, A extends object = any> = {
  add(title: string, handler?: CommandHandler<P, A>): ICommandBuilder<P, A>;
  add(args: IAddCommandArgs<P, A>): ICommandBuilder<P, A>;
};

export type IAddCommandArgs<P extends object = any, A extends object = any> = {
  title: string;
} & Partial<ICommand<P, A>>;

/**
 * The handler that is invoked for a command.
 * Generics:
 *  - `P` stands for `props`
 *  - `O` stands for argument `options`
 */
export type CommandHandler<P extends object = any, A extends object = any> = (
  e: ICommandHandlerArgs<P, A>,
) => any | Promise<any>;

/**
 * Arguments passed to a command handler.
 * Generics:
 *  - `P` stands for `props`
 *  - `O` stands for argument `options`
 */
export type ICommandHandlerArgs<P extends object = any, A extends object = any> = {
  args: ICommandArgs<A>;
  props: P;
  get<K extends keyof P>(key: K): P[K];
  set<K extends keyof P>(key: K, value: P[K]): ICommandHandlerArgs<P, A>;
};

/**
 * The response from an invokation of the handler.
 */
export type ICommandInvokePromise<P extends object, A extends object, R> = Promise<
  ICommandInvokeResponse<P, A, R>
> &
  ICommandInvokeResponse<P, A, R>;
export type ICommandInvokeResponse<P extends object, A extends object, R> = {
  events$: Observable<CommandInvokeEvent>;
  isComplete: boolean;
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
