export type IBundleManifest = {
  createdAt: number;
  bytes: number;
  size: string;
  files: string[];
};

/**
 * The manigest YAML hosted on S3.
 */
export type IManifest = {
  sites: ISiteManifest[];
};

/**
 * The manifest of a single url-end-point.
 */
export type ISiteManifest = {
  domain: string;
  bundle: string; // Path to the bundle folder.
  routes: { [key: string]: ISiteManifestRoute };
  files: string[];
};

export type ISiteManifestRoute = {
  entry: string; // Entry filename (.html)
  path: string[]; // URL pathname.
};
