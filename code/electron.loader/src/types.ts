import { IpcClient } from '@platform/electron/lib/types';

export type LoaderIpc = IpcClient<ElectronLoaderEvents>;

/**
 * [Events]
 */
export type ElectronLoaderEvents = IDownloadEvent | IBundleEvent;

export type IDownloadEvent = {
  type: 'ELECTRON/download';
  payload: {};
};

export type IBundleEvent = {
  type: 'ELECTRON/bundle';
  payload: { source: { main: string; renderer: string }; target: string };
};
