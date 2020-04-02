/**
 * [Events]
 */
export type TypedSheetEvent = ITypedSheetChangeCellEvent;

/**
 * Dispatches a change to a cell's data.
 */
export type ITypedSheetChangeCellEvent = {
  type: 'SHEET/change/cell';
  payload: ITypedSheetChangeCell;
};
export type ITypedSheetChangeCell = {};
