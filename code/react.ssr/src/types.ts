/**
 * The parts of a bundle entry HTML.
 */
export type IBundleEntryManifest = {
  scripts: string[];
  stylesheets: string[];
};
export type IBundleEntryFileManifest = IBundleEntryManifest & {
  exists: boolean;
  entry: string;
};

/**
 * The manigest YAML hosted on S3.
 */
export type ICloudManifest = {
  sites: ICloudSiteManifest[];
};

/**
 * The manifest of a single url-end-point.
 */
export type ICloudSiteManifest = {
  domain: string;
  bundle: string; // Path to the bundle folder.
};
