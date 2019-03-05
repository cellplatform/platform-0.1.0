import { ICommandArgs } from '../types';

/**
 * Represents a single [command] which is a named unit of
 * functionality that can optionally take parameter input.
 *
 * Generics:
 *  - `P` stands for `props`
 *  - `O` stands for argument `options`
 */
export type ICommand<P extends object = any, A extends object = any> = {
  title: string;
  children: ICommand[];
  handler: CommandHandler<P, A>;
};

/**
 * Represents an API for building a tree of commands.
 */
export type ICommandBuilder<P extends object = any, A extends object = any> = ICommand<P, A> & {
  length: number;
  children: ICommandBuilder[];
  add(title: string, handler?: CommandHandler<P, A>): ICommandBuilder<P, A>;
  add(args: IAddCommandArgs<P, A>): ICommandBuilder<P, A>;
  toObject(): ICommand<P, A>;
  clone(options?: { deep?: boolean }): ICommandBuilder<P, A>;
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
) => any;

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
  clear: () => ICommandHandlerArgs<P, A>;
};
