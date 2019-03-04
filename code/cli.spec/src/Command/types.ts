export type IDescribeArgs<P extends object = any> = { title: string } & Partial<ICommand<P>>;

/**
 * Represents a single [command] which is a named unit of
 * functionality that can optionally take parameter input.
 *
 * `P` denotes `props` (or `params` etc).
 */
export type ICommand<P extends object = any> = {
  title: string;
  children: ICommand[];
  handler: CommandHandler<P>;
};

export type ICommandBuilder<P extends object = any> = ICommand & {
  length: number;
  children: ICommandBuilder[];
  add(title: string, handler?: CommandHandler<P>): ICommandBuilder<P>;
  add(args: IDescribeArgs): ICommandBuilder<P>;
  toObject(): ICommand<P>;
  clone(options?: { deep?: boolean }): ICommandBuilder<P>;
};

/**
 * The handler that is invoked for a command.
 */
export type CommandHandler<P extends object = any> = (e: ICommandHandlerArgs<P>) => any;

/**
 * Arguments passed to a command handler.
 * `<P>` stands for `props`.
 */
export type ICommandHandlerArgs<P extends object = any> = {
  props: P;
  get<K extends keyof P>(key: K): P[K];
  set<K extends keyof P>(key: K, value: P[K]): ICommandHandlerArgs<P>;
  clear: () => ICommandHandlerArgs<P>;
};
