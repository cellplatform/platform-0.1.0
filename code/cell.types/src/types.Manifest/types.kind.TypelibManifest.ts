import { t } from '../common';

/**
 * Manifest of a library of ".d.ts" declaration files.
 */
// export type TypelibManifest = {
//   kind: 'typelib';
//   typelib: t.TypelibManifestInfo;
//   files: TypelibManifestFile[];
//   hash: {
//     files: string; // NB: The hash of all [filehash]'s in the manifest.
//   };
// };

export type TypelibManifest = t.Manifest<TypelibManifestFile> & {
  kind: 'typelib';
  typelib: t.TypelibManifestInfo;
};

export type TypelibManifestFile = t.ManifestFile & {
  declaration: t.TypelibManifestFileInfo;
};

export type TypelibManifestFileInfo = {
  imports: string[]; // Reference imported from another module.
  exports: string[]; // Reference exported from another module.
};

export type TypelibManifestInfo = {
  name: string;
  version: string;
  entry: string; // NB: "types" field in [package.json].
};
