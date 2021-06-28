import { t } from '../common';

// export type Manifest = t.BundleManifest | t.TypelibManifest;

export type Manifest<F extends t.ManifestFile = t.ManifestFile> = {
  hash: { files: string }; // NB: The hash of all [filehash]'s in the manifest's [files] list.
  files: F[];
};
