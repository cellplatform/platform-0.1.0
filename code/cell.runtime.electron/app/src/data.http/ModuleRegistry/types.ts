import { ManifestSourceKind } from '../Manifest/types';
type CellUri = string;

export type ManifestUrl = string;
export type ManifestPath = string;
export type ManifestSource = ManifestUrl | ManifestPath;

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
  kind: ManifestSourceKind;
};
