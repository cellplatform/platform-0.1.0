import { ICommandArgs } from '../types';

/**
 * Represents a single [command] which is a named unit of
 * functionality that can optionally take parameter input.
 *
 * Generics:
 *  - `P` stands for `props`
 *  - `O` stands for argument `options`
 */
export type ICommand<P extends object = any, O extends object = any> = {
  title: string;
  children: ICommand[];
  handler: CommandHandler<P, O>;
};

/**
 * Represents an API for building a tree of commands.
 */
export type ICommandBuilder<P extends object = any, O extends object = any> = ICommand<P, O> & {
  length: number;
  children: ICommandBuilder[];
  add(title: string, handler?: CommandHandler<P, O>): ICommandBuilder<P, O>;
  add(args: IAddCommandArgs<P, O>): ICommandBuilder<P, O>;
  toObject(): ICommand<P, O>;
  clone(options?: { deep?: boolean }): ICommandBuilder<P, O>;
};

export type IAddCommandArgs<P extends object = any, O extends object = any> = {
  title: string;
} & Partial<ICommand<P, O>>;

/**
 * The handler that is invoked for a command.
 * Generics:
 *  - `P` stands for `props`
 *  - `O` stands for argument `options`
 */
export type CommandHandler<P extends object = any, O extends object = any> = (
  e: ICommandHandlerArgs<P, O>,
) => any;

/**
 * Arguments passed to a command handler.
 * Generics:
 *  - `P` stands for `props`
 *  - `O` stands for argument `options`
 */
export type ICommandHandlerArgs<P extends object = any, O extends object = any> = {
  args: ICommandArgs<O>;
  props: P;
  get<K extends keyof P>(key: K): P[K];
  set<K extends keyof P>(key: K, value: P[K]): ICommandHandlerArgs<P>;
  clear: () => ICommandHandlerArgs<P>;
};
