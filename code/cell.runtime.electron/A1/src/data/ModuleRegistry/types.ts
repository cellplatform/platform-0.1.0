import { ManifestSourceKind } from './common/types';

type CellUri = string;

export type ManifestSourceUrl = string;
export type ManifestSourcePath = string;
export type ManifestSourceAddress = ManifestSourceUrl | ManifestSourcePath;

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
  source: ManifestSourceAddress;
  fs: CellUri;
};

export type RegistryManifestSource = {
  manifest: ManifestSourceAddress;
  kind: ManifestSourceKind;
};
