import { t } from '../common';

type Sha256 = string;

export type Manifest<
  F extends t.ManifestFile = t.ManifestFile,
  H extends ManifestHash = ManifestHash,
> = {
  hash: H;
  files: F[];
};

export type ManifestHash = {
  files: Sha256; // The hash of all [filehash] values in the manifest [files] list.
};

/**
 * URL (Uniform Resource Locator) pointing to a manifest.
 */
export type ManifestUrl = string;
