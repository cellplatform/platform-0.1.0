export type ManifestSourceKind = 'url' | 'filepath';

export type ManifestSource = {
  path: string;
  kind: ManifestSourceKind;
  domain: string | 'local:package';
  dir: string;
  toString(): string;
};
