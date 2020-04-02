import * as t from './types';

export type IStateArgs = {
  events$: t.Observable<t.TypedSheetEvent>;
};

/**
 * State machine for a strongly-typed sheet.
 */
export class TypedSheetState<T> implements t.ITypedSheetState<T> {
  public static create<T>(args: IStateArgs) {
    return new TypedSheetState<T>(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IStateArgs) {
    this.events$ = args.events$;
  }

  /**
   * [Fields]
   */

  public readonly events$: t.Observable<t.TypedSheetEvent>;
}
