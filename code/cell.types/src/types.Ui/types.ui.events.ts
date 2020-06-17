/**
 * Events
 */
export type UiEvent = IUiWindowAddressPasteEvent | IUiWindowResizeEvent;

/**
 * Document (DOM)
 */
export type IUiWindowResizeEvent = {
  type: 'UI:DOM/window/resize';
  payload: IUiWindowResize;
};
export type IUiWindowResize = { width: number; height: number };

/**
 * Clipboard paste
 */
export type IUiWindowAddressPasteEvent = {
  type: 'UI:WindowAddress/paste';
  payload: IUiWindowAddressPaste;
};
export type IUiWindowAddressPaste = {
  event: ClipboardEvent;
  text: string;
};
