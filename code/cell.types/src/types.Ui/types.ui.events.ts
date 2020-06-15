/**
 * Events
 */
export type UiEvent = IUiWindowAddressPasteEvent;

export type IUiWindowAddressPasteEvent = {
  type: 'UI/WindowAddress/paste';
  payload: IUiWindowAddressPaste;
};
export type IUiWindowAddressPaste = {
  event: ClipboardEvent;
};
