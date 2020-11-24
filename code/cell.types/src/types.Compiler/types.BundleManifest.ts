/**
 * Details about a compiled bundle of code.
 */
export type BundleManifest = {
  hash: string;
  mode: string;
  target: string;
  entry: string;
  remoteEntry?: string;
  bytes: number;
  files: BundleManifestFile[];
};

export type BundleManifestFile = {
  path: string;
  bytes: number;
  filehash: string;
  uri?: string;
  allowRedirect?: boolean; // Default: true
  public?: boolean; // Default: false (when not TRUE requires signed link to access S3)
};
