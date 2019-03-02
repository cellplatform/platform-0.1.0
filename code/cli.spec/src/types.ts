export type IDescribeArgs<P = {}> = { title: string } & Partial<ICommand<P>>;

/**
 * Represents a single [command] which is a named unit of
 * functionality that can optionally take parameter input.
 */
export type ICommand<P = {}> = {
  title: string;
  handler: CommandHandler<P>;
  children: ICommand[];
};

export type ICommandBuilder<P = {}> = ICommand & {
  length: number;
  children: ICommandBuilder[];
  add(title: string, handler?: CommandHandler<P>): ICommandBuilder<P>;
  add(args: IDescribeArgs): ICommandBuilder;
  toObject(): ICommand<P>;
  clone(options?: { deep?: boolean }): ICommandBuilder<P>;
};

/**
 * The handler that is invoked for a command.
 */
export type CommandHandler<P = {}> = (e: ICommandHandlerArgs<P>) => any;

/**
 * Arguments passed to a command handler.
 * `<P>` stands for `props`.
 */
export type ICommandHandlerArgs<P = {}> = {
  props: P;
  get<K extends keyof P>(key: K): P[K];
  set<K extends keyof P>(key: K, value: P[K]): ICommandHandlerArgs<P>;
  clear: () => ICommandHandlerArgs<P>;
};
