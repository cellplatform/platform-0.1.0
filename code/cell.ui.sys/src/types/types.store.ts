import { t } from './common';

export type IAppStore = t.IStore<t.IAppState, t.AppEvent>;

export type IAppState = {
  error?: t.ISpreadsheetError;
  overlay?: IAppStateOverlay;
};

/**
 * Overlays
 */
export type IAppStateOverlay = IAppStateOverlayWindows;

export type IAppStateOverlayWindows = {
  kind: 'WINDOWS';
  uri: string;
};
