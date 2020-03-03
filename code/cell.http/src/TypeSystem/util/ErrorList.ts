import { t, value } from '../common';

type IErrorListArgs = {
  defaultType: string;
  errors?: t.IError[];
};

export class ErrorList {
  /**
   * Lifecycle
   */
  public static create = (args: IErrorListArgs) => new ErrorList(args);
  private constructor(args: IErrorListArgs) {
    this.defaultType = args.defaultType;
    this.list = args.errors || [];
  }

  /**
   * [Fields]
   */
  public readonly list: t.IError[];
  public readonly defaultType: string;

  /**
   * Properties
   */
  public get length() {
    return this.list.length;
  }

  public get ok() {
    return this.length === 0;
  }

  /**
   * [Methods]
   */
  public add(message: string, options: { errorType?: string; children?: t.IError[] } = {}) {
    const type = options.errorType || this.defaultType;
    const children = options.children;
    const error: t.IError = value.deleteUndefined({ message, type, children });
    this.list.push(error);
    return error;
  }
}
