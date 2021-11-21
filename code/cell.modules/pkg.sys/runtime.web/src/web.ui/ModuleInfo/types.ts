import { ManifestUrl, ModuleManifest } from '@platform/cell.types';

type Path = string;

export type ModuleInfoTitle = string | React.ReactNode | null;
export type ModuleInfoFields =
  | 'url'
  | 'namespace'
  | 'version'
  | 'compiled'
  | 'kind'
  | 'files'
  | ModuleInfoFieldsHash
  | ModuleInfoHashRemote;

export type ModuleInfoFieldsHash = 'hash' | 'hash.module' | 'hash.files';
export type ModuleInfoHashRemote = 'remote' | 'remote' | 'remote.exports';

/**
 * Alert listeners when a remote "export" reference is clicked.
 */
export type ModuleInfoExportClick = (e: ModuleInfoExportClickArgs) => void;
export type ModuleInfoExportClickArgs = {
  url: ManifestUrl;
  entry: Path;
  manifest: ModuleManifest;
};
