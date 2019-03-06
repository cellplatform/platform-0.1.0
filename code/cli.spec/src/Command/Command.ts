import { Subject } from 'rxjs';
import { share, takeUntil } from 'rxjs/operators';

import { value } from '../common';
import { invoker } from './invoke';
import * as t from './types';

type IConstructorArgs = {
  title: string;
  handler: t.CommandHandler;
  children: t.ICommandBuilder[];
};

export const DEFAULT = {
  HANDLER: (() => null) as t.CommandHandler,
};

/**
 * Represents a single [command] which is a named unit of functionality
 * within a program that can optionally take parameter input.
 */
export class Command<P extends object = any, A extends object = any>
  implements t.ICommandBuilder<P, A> {
  /**
   * [Static]
   */
  public static create<P extends object = any, A extends object = any>(
    title: string,
    handler?: t.CommandHandler,
  ): t.ICommandBuilder<P, A>;
  public static create<P extends object = any, A extends object = any>(
    args: t.IAddCommandArgs,
  ): t.ICommandBuilder<P, A>;
  public static create<P extends object = any, A extends object = any>(
    ...args: any
  ): t.ICommandBuilder<P, A> {
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

    this._.title = title;
    this._.handler = handler;
    this._.children = children;
  }

  /**
   * [Fields]
   */
  private readonly _ = {
    title: '',
    handler: (undefined as unknown) as t.CommandHandler,
    children: [] as t.ICommandBuilder[],
    dispose$: new Subject(),
    events$: new Subject<t.CommandEvent>(),
  };
  public readonly dispose$ = this._.dispose$.pipe(share());
  public readonly events$ = this._.events$.pipe(
    takeUntil(this.dispose$),
    share(),
  );

  /**
   * [Properties]
   */
  public get title() {
    return this._.title;
  }

  public get handler() {
    return this._.handler;
  }

  public get children(): t.ICommandBuilder[] {
    return this._.children;
  }

  public get length() {
    return this.children.length;
  }

  public get isDisposed() {
    return this._.dispose$.isStopped;
  }

  /**
   * [Methods]
   */
  public dispose() {
    this._.dispose$.next();
    this._.dispose$.complete();
  }

  public as<P1 extends object, A1 extends object>(fn: (e: t.ICommandBuilder<P1, A1>) => void) {
    fn((this as unknown) as t.ICommandBuilder<P1, A1>);
    return this;
  }

  /**
   * Cast children to given types.
   */
  public childrenAs<P1 extends object, A1 extends object>() {
    return this.children as Array<t.ICommandBuilder<P1, A1>>;
  }

  /**
   * Adds a child command.
   */
  public add<P1 extends object = P, A1 extends object = A>(
    title: string,
    handler: t.CommandHandler<P1, A1>,
  ): t.ICommandBuilder<P, A>;

  public add<P1 extends object = P, A1 extends object = A>(
    args: t.IAddCommandArgs<P1, A1>,
  ): t.ICommandBuilder<P, A>;

  public add(...args: any): t.ICommandBuilder<P, A> {
    const child = new Command(toConstuctorArgs(args));
    child.events$.pipe(takeUntil(this.dispose$)).subscribe(e => this._.events$.next(e));
    this._.children = [...this._.children, child] as t.ICommandBuilder[];
    return this;
  }

  /**
   * Converts the builder to a simple object.
   */
  public toObject(): t.ICommand<P, A> {
    const children = this.children.map(child => child.toObject());
    const title = this.title;
    const handler = this.handler;
    const events$ = this.events$;
    const invoke: t.InvokeCommand<P, A> = options => this.invoke(options);
    return { events$, title, handler, children, invoke };
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
   * Invokes the command's handler.
   */
  public invoke<R>(options: {
    props: P;
    args?: string | t.ICommandArgs<A>;
    timeout?: number;
  }): t.ICommandInvokePromise<P, A, R> {
    return invoker<P, A, R>({ ...options, command: this, events$: this._.events$ });
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
  throw new Error(`[Args] could not be interpreted.`);
}

function cloneChildren(builder: t.ICommandBuilder): t.ICommandBuilder[] {
  return builder.children
    .map(child => child as t.ICommandBuilder)
    .map(child => child.clone({ deep: true }));
}
