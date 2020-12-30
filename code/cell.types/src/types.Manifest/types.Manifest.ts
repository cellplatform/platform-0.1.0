import { t } from '../common';

export type Manifest<F extends t.ManifestFile = t.ManifestFile> = {
  hash: string; // NB: The hash of all file-hashes.
  files: F[];
};

export type ManifestFile = {
  path: string;
  bytes: number;
  filehash: string;
  uri?: string;
  allowRedirect?: boolean; // Default: true
  public?: boolean; // Default: false (when not true requires signed link to access S3).
};

export type ManifestValidation = {
  ok: boolean;
  dir: string;
  errors: t.ManifestValidationError[];
};
export type ManifestValidationError = {
  path: string;
  hash: { manifest: string; filesystem: string };
  message: string;
};
