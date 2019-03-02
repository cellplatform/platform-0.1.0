import { ICommand, value, CommandHandler, IDescribeArgs, ICommandBuilder } from '../common';

type IConstructorArgs = ICommand & {
  children: ICommandBuilder[];
};

export const DEFAULT = {
  HANDLER: (() => null) as CommandHandler,
};

/**
 * Represents a single [command] which is a named unit of
 * functionality that can optionally take parameter input.
 */
export class Command implements ICommandBuilder {
  private _: IConstructorArgs;

  /**
   * [Static]
   */
  public static describe(title: string, handler?: CommandHandler): ICommandBuilder;
  public static describe(args: IDescribeArgs): ICommandBuilder;
  public static describe(...args: any): ICommandBuilder {
    return new Command(toConstuctorArgs(args));
  }

  /**
   * [Constructor]
   */
  private constructor(args: Partial<IConstructorArgs>) {
    const title = (args.title || '').trim();
    const handler = args.handler || DEFAULT.HANDLER;
    const children = args.children || [];

    if (!title) {
      throw new Error(`A command title must be specified.`);
    }

    if (typeof handler !== 'function') {
      throw new Error(`A command handler must be a function.`);
    }

    this._ = { title, handler, children };
  }

  /**
   * [Properties]
   */
  public get title() {
    return this._.title;
  }

  public get handler() {
    return this._.handler;
  }

  public get children(): ICommandBuilder[] {
    return this._.children;
  }

  public get length() {
    return this.children.length;
  }

  /**
   * [Methods]
   */

  /**
   * Creates an immutable clone of the object.
   */
  public clone(options: { deep?: boolean } = {}) {
    const deep = value.defaultValue(options.deep, true);
    let args = { ...this._ };
    if (deep) {
      args = { ...args, children: cloneChildren(this) };
    }
    return new Command(args);
  }

  /**
   * Adds a child command.
   */
  public add(title: string, handler: CommandHandler): ICommandBuilder;
  public add(args: IDescribeArgs): ICommandBuilder;
  public add(...args: any): ICommandBuilder {
    const child = new Command(toConstuctorArgs(args));
    this._.children = [...this._.children, child] as ICommandBuilder[];
    return this;
  }

  /**
   * Converts the builder to a simple object.
   */
  public toObject(): ICommand {
    const children = this.children.map(child => child.toObject());
    const title = this.title;
    const handler = this.handler;
    return { title, handler, children };
  }
}

/**
 * [INTERNAL]
 */
function toConstuctorArgs(args: any): IConstructorArgs {
  if (typeof args[0] === 'string') {
    const [title, handler] = args;
    return { title, handler, children: [] };
  }
  if (typeof args[0] === 'object') {
    return args[0] as IConstructorArgs;
  }
  throw new Error(`Args could not be interpreted.`);
}

export function cloneChildren(builder: ICommandBuilder): ICommandBuilder[] {
  return builder.children.map(child => child as Command).map(child => child.clone({ deep: true }));
}
