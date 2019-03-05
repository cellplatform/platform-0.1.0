import { CommandHandler, ICommand, ICommandTree, IAddCommandArgs, value } from '../common';

type IConstructorArgs = ICommand & {
  children: ICommandTree[];
};

export const DEFAULT = {
  HANDLER: (() => null) as CommandHandler,
};

/**
 * Represents a single [command] which is a named unit of functionality
 * within a program that can optionally take parameter input.
 */
export class Command<P extends object = any, O extends object = any> implements ICommandTree<P, O> {
  private readonly _: IConstructorArgs;

  /**
   * [Static]
   */
  public static create<P extends object = any, O extends object = any>(
    title: string,
    handler?: CommandHandler,
  ): ICommandTree<P, O>;
  public static create<P extends object = any, O extends object = any>(
    args: IAddCommandArgs,
  ): ICommandTree<P, O>;
  public static create<P extends object = any, O extends object = any>(
    ...args: any
  ): ICommandTree<P, O> {
    return new Command<P, O>(toConstuctorArgs(args));
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

  public get children(): ICommandTree[] {
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
    return new Command<P>(args);
  }

  /**
   * Adds a child command.
   */
  public add(title: string, handler: CommandHandler): ICommandTree<P, O>;
  public add(args: IAddCommandArgs): ICommandTree<P, O>;
  public add(...args: any): ICommandTree<P, O> {
    const child = new Command(toConstuctorArgs(args));
    this._.children = [...this._.children, child] as ICommandTree[];
    return this;
  }

  /**
   * Converts the builder to a simple object.
   */
  public toObject(): ICommand<P, O> {
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

function cloneChildren(builder: ICommandTree): ICommandTree[] {
  return builder.children.map(child => child as Command).map(child => child.clone({ deep: true }));
}
