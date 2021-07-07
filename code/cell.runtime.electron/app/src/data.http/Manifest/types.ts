type Uri = string;

export type ManifestSourceKind = 'url' | 'filepath';

export type ManifestSource = {
  path: string;
  kind: ManifestSourceKind;
  domain: string | 'local:package';
  dir: string;
  toString(): string;
};

export type ManifestUrl = {
  ok: boolean;
  href: string;
  domain: string;
  cell: Uri;
  path: string;
  dir: string;
  filename: string;
  error?: string;
};
