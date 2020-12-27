import { t } from '../common';

/**
 * Manifest of ".d.ts" declaration files.
 */
export type FsTypeManifest = t.FsManifest<FsTypeManifestFile>;

export type FsTypeManifestFile = t.FsManifestFile & {
  declaration: t.FsTypeManifestFileInfo;
};

export type FsTypeManifestFileInfo = {
  imports: string[]; // Reference imported from another module.
  exports: string[]; // Reference exported from another module.
};
