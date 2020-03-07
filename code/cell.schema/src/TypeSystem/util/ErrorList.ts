import { t, value, R } from '../common';

type IErrorListArgs = {
  defaultType: t.TypeError;
  errors?: t.ITypeError[];
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
  public readonly _list: t.ITypeError[];
  public readonly defaultType: t.TypeError;

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
  public add(
    ns: string,
    message: string,
    options: {
      column?: string;
      errorType?: t.TypeError;
      children?: t.IError[];
    } = {},
  ) {
    const type = options.errorType || this.defaultType;
    const { column, children } = options;
    const error: any = value.deleteUndefined({ ns, column, type, message, children });
    this._list.push(error);
    return error;
  }
}
