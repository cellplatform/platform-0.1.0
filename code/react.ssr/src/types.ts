/**
 * The parts of a bundle entry HTML.
 */
export type IBundleEntry = {
  scripts: string[];
  stylesheets: string[];
};
export type IBundleEntryFile = IBundleEntry & {
  exists: boolean;
  entry: string;
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
};

export type ISiteManifestRoute = {
  entry: string; // Entry filename (.html)
  path: string[]; // URL pathname.
};
