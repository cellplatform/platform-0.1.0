import { t } from '../common';

/**
 * Manifest of ".d.ts" declaration files.
 */
export type TypeManifest = t.Manifest<TypeManifestFile> & {
  kind: 'types.d';
};

export type TypeManifestFile = t.ManifestFile & {
  declaration: t.TypeManifestFileInfo;
};

export type TypeManifestFileInfo = {
  imports: string[]; // Reference imported from another module.
  exports: string[]; // Reference exported from another module.
};
