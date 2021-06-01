import { t } from './common';

export type ElectronDataPaths = {
  dir: string;
  db: string;
  fs: string;
  config: string; //    Configuration [.json] file.
  archive: string; //   Data backup folder.
  log: string; //       Log output.
};
