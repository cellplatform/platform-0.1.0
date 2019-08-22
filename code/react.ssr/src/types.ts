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
  version: string;
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
  name: string;
  domain: string[]; // string or "/regex/".
  bundle: string; // Path to the bundle folder.
  routes: { [key: string]: ISiteManifestRoute };

  // Extended.
  size: string;
  bytes: number;
  baseUrl: string;
  files: string[];
  entries: IBundleEntryHtml[];
};

export type ISiteManifestRoute = {
  entry: string; // Entry filename (.html)
  path: string[]; // URL pathname.
};

/**
 * SSR configuration.
 */
export type ISsrConfig = {
  manifest: string; // Path to the [manifest.yml] file.
  secret: string; // API secret.
  builder: {
    bundles: string; // Path to the folder containing built JS bundle-dirs.
    entries: string; // Path to a JS file to execute that produces the IBundleEntryElement[].
  };
  s3: {
    endpoint: string;
    cdn?: string;
    accessKey: string;
    secret: string;
    bucket: string;
    path: {
      base: string;
      manifest: string;
      bundles: string;
    };
  };
};
