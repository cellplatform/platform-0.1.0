import { IpcClient } from '@platform/electron/lib/types';
export type LoaderIpc = IpcClient<ElectronLoaderEvents>;

/**
 * Manififest info about a release bundle.
 */
export type IBundleInfo = {
  name: string;
  version: string;
  createdAt: number;
  file: string;
  size: string;
  bytes: number;
  checksum: string;
  hash: 'sha256';
};

/**
 * [Events]
 */
export type ElectronLoaderEvents = IDownloadEvent | IOpenWindowEvent;

export type IDownloadEvent = {
  type: 'ELECTRON_LOADER/download';
  payload: { version: string };
};

export type IOpenWindowEvent = {
  type: 'ELECTRON_LOADER/open';
  payload: { version: string; html: string };
};
