type Semver = string; // Semantic version.
type CellUri = string;

export type RuntimeModule = {
  module: { name: string; version: Semver };
};

export type BundleCellAddress = {
  host: string;
  uri: CellUri;
  dir?: string;
  hash?: string; // Manifest hash (used to verify files have not been changed).
};
