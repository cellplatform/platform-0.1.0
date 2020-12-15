export type FsManifest<F extends FsManifestFile = FsManifestFile> = {
  hash: string;
  files: F[];
};

export type FsManifestFile = {
  path: string;
  bytes: number;
  filehash: string;
  uri?: string;
  allowRedirect?: boolean; // Default: true
  public?: boolean; // Default: false (when not true requires signed link to access S3).
};
