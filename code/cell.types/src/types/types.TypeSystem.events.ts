/**
 * [Events]
 */
export type TypedSheetEvent = ITypedSheetFetchEvent;

export type ITypedSheetFetch = {};
export type ITypedSheetFetchEvent = {
  type: 'SHEET/fetch';
  payload: ITypedSheetFetch;
};
