type CellUri = string;

export type ManifestUrl = string;
export type ManifestFilepath = string;
export type ManifestSource = ManifestUrl | ManifestFilepath;

export type RegistryCellPropsDomain = {
  title: string;
  domain: string;
};

export type RegistryCellPropsNamespace = {
  title: string;
  namespace: string;
  versions: RegistryNamespaceVersion[];
};

export type RegistryNamespaceVersion = {
  createdAt: number;
  modifiedAt: number;
  version: string;
  hash: string;
  source: RegistryManifestSource;
  fs: CellUri;
};

export type RegistryManifestSource = {
  manifest: ManifestSource;
  kind: 'url' | 'filepath';
};
