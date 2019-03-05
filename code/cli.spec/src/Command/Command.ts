import { CommandHandler, ICommand, ICommandBuilder, IAddCommandArgs, value } from '../common';

type IConstructorArgs = ICommand & {
  children: ICommandBuilder[];
};

export const DEFAULT = {
  HANDLER: (() => null) as CommandHandler,
};

/**
 * Represents a single [command] which is a named unit of functionality
 * within a program that can optionally take parameter input.
 */
export class Command<P extends object = any, A extends object = any>
  implements ICommandBuilder<P, A> {
  private readonly _: IConstructorArgs;

  /**
   * [Static]
   */
  public static create<P extends object = any, A extends object = any>(
    title: string,
    handler?: CommandHandler,
  ): ICommandBuilder<P, A>;
  public static create<P extends object = any, A extends object = any>(
    args: IAddCommandArgs,
  ): ICommandBuilder<P, A>;
  public static create<P extends object = any, A extends object = any>(
    ...args: any
  ): ICommandBuilder<P, A> {
    return new Command<P, A>(toConstuctorArgs(args));
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

  public as<P1 extends object, A1 extends object>(fn: (e: ICommandBuilder<P1, A1>) => void) {
    fn((this as unknown) as ICommandBuilder<P1, A1>);
    return this;
  }

  /**
   * Cast children to given types.
   */
  public childrenAs<P1 extends object, A1 extends object>() {
    return this.children as Array<ICommandBuilder<P1, A1>>;
  }

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
  public add<P1 extends object = P, A1 extends object = A>(
    title: string,
    handler: CommandHandler<P1, A1>,
  ): ICommandBuilder<P, A>;

  public add<P1 extends object = P, A1 extends object = A>(
    args: IAddCommandArgs<P1, A1>,
  ): ICommandBuilder<P, A>;

  public add(...args: any): ICommandBuilder<P, A> {
    const child = new Command(toConstuctorArgs(args));
    this._.children = [...this._.children, child] as ICommandBuilder[];
    return this;
  }

  /**
   * Converts the builder to a simple object.
   */
  public toObject(): ICommand<P, A> {
    const children = this.children.map(child => child.toObject());
    const title = this.title;
    const handler = this.handler;
    return { title, handler, children };
  }
}

/**
 * [Internal]
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

function cloneChildren(builder: ICommandBuilder): ICommandBuilder[] {
  return builder.children
    .map(child => child as ICommandBuilder)
    .map(child => child.clone({ deep: true }));
}
