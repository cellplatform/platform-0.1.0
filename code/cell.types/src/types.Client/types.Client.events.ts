import { t } from '../common';

export type ITypedSheetPendingChanges = { [ns: string]: t.ITypedSheetChanges };

/**
 * Save monitor (events).
 */
export type TypedSheetSaveEvent = ITypedSheetSavingEvent | ITypedSheetSavedEvent;

export type ITypedSheetSavingEvent = {
  type: 'SHEET/saving';
  payload: ITypedSheetSaving;
};
export type ITypedSheetSaving = {
  target: string;
  sheet: t.ITypedSheet;
  changes: t.ITypedSheetChanges;
};

export type ITypedSheetSavedEvent = {
  type: 'SHEET/saved';
  payload: ITypedSheetSaved;
};
export type ITypedSheetSaved = {
  ok: boolean;
  target: string;
  sheet: t.ITypedSheet;
  changes: t.ITypedSheetChanges;
  errors: { ns: string; error: t.IHttpError }[];
};
