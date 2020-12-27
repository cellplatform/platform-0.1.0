export type Manifest<F extends ManifestFile = ManifestFile> = {
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
