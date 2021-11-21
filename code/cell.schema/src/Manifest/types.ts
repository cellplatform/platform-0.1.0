type Uri = string;
type Path = string;

export type ManifestSourceKind = 'url' | 'filepath';

export type ManifestSource = {
  path: string;
  kind: ManifestSourceKind;
  domain: string | 'runtime:electron:bundle';
  dir: string;
  toString(): string;
};

export type ManifestUrlParts = {
  ok: boolean;
  href: string;
  protocol: 'http' | 'https';
  domain: string;
  cell: Uri;
  path: Path;
  dir: string;
  filename: string;
  params: ManifestUrlParams;
  error?: string;
};

export type ManifestUrlParams = { entry: Path };
