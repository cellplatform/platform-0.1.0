import { t, value, R } from '../common';

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
    this._list = args.errors ? [...args.errors] : [];
  }

  /**
   * [Fields]
   */
  public readonly _list: t.IError[];
  public readonly defaultType: string;

  /**
   * Properties
   */
  public get length() {
    return this._list.length;
  }

  public get ok() {
    return this.length === 0;
  }

  public get list() {
    return R.uniq(this._list);
  }

  /**
   * [Methods]
   */
  public add(message: string, options: { errorType?: string; children?: t.IError[] } = {}) {
    const type = options.errorType || this.defaultType;
    const children = options.children;
    const error: t.IError = value.deleteUndefined({ message, type, children });
    this._list.push(error);
    return error;
  }
}
