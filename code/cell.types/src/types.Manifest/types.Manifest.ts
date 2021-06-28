import { t } from '../common';

export type Manifest<
  F extends t.ManifestFile = t.ManifestFile,
  H extends ManifestHash = ManifestHash,
> = {
  hash: H;
  files: F[];
};

export type ManifestHash = {
  files: string; // NB: The hash of all [filehash]'s in the manifest's [files] list.
};
