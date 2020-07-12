import { t } from './common';

export type IAppStore = t.IStore<t.IAppState, t.AppEvent>;

export type IAppState = {
  error?: t.ISysError;
  overlay?: IAppStateOverlay;
};

/**
 * Overlays
 */
export type IAppStateOverlay = IAppStateOverlayWindows | IAppStateOverlayInstall;

export type IAppStateOverlayWindows = {
  kind: 'WINDOWS';
  uri: string;
};

export type IAppStateOverlayInstall = {
  kind: 'INSTALL';
  dir: string;
  files?: t.IHttpClientCellFileUpload[];
  urls?: string[];
};
