/**
 * S3 object storage.
 */
export type IS3Config = {
  endpoint: string;
  accessKey: string;
  secret: string;
};

/**
 * Bundle
 */
export type IBundleManifest = {
  createdAt: number;
  bytes: number;
  size: string;
  files: string[];
  entries: IBundleEntryHtml[];
};

export type IBundleEntryElement = { file: string; el: JSX.Element; id?: string };
export type IBundleEntryHtml = { id: string; file: string; html: string; css: string };

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
  entries: IBundleEntryHtml[];
};

export type ISiteManifestRoute = {
  entry: string; // Entry filename (.html)
  path: string[]; // URL pathname.
};
