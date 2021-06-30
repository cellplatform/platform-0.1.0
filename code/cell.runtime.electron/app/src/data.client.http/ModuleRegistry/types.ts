type CellUri = string;

export type ManifestUrl = string;
export type ManifestFilepath = string;
export type ManifestSource = ManifestUrl | ManifestFilepath;

export type RegistryCellPropsDomain = {
  title: string;
  domain: string;
};

export type RegistryCellPropsNamespace = {
  kind: 'registry:namespace';
  title: string;
  namespace: string;
  versions: RegistryNamespaceVersion[];
};

export type RegistryNamespaceVersion = {
  kind: 'registry:module';
  createdAt: number;
  modifiedAt: number;
  version: string;
  hash: string;
  source: ManifestSource;
  fs: CellUri;
};

export type RegistryManifestSource = {
  manifest: ManifestSource;
  kind: 'url' | 'filepath';
};
