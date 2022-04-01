import { ManifestUrl, ModuleManifest } from '@platform/cell.types';

type Path = string;

export type ModuleInfoTitle = string | React.ReactNode | null;
export type ModuleInfoFields =
  | 'namespace'
  | 'version'
  | 'compiled'
  | 'kind'
  | 'files'
  | ModuleInfoFieldSource
  | ModuleInfoFieldHash
  | ModuleInfoFieldRemote;

export type ModuleInfoFieldSource = 'source:url' | 'source:url:hash';
export type ModuleInfoFieldHash = 'hash.module:title' | 'hash.module' | 'hash.files';
export type ModuleInfoFieldRemote = 'remote' | 'remote.exports';

/**
 * Alert listeners when a remote "export" reference is clicked.
 */
export type ModuleInfoExportClick = (e: ModuleInfoExportClickArgs) => void;
export type ModuleInfoExportClickArgs = {
  url: ManifestUrl;
  entry: Path;
  manifest: ModuleManifest;
};
