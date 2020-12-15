import { t } from '../common';

/**
 * Details about a compiled bundle of code.
 */
export type BundleManifest = t.FsManifest & {
  mode: string; // production | development
  target: string; // web | node
  entry: string;
  remoteEntry?: string;
};
