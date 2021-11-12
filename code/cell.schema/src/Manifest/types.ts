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
  domain: string;
  cell: Uri;
  path: Path;
  dir: string;
  filename: string;
  entry: Path;
  error?: string;
};
