import { t } from './common';

type FilesystemId = string;
type FilePath = string;

export type SysFsManifestDirResponse = {
  dir: FilePath;
  manifest: t.DirManifest;
  error?: t.SysFsError;
};

/**
 * EVENTS
 */
export type SysFsIndexEvent = SysFsManifestReqEvent | SysFsManifestResEvent;

/**
 * Manifest index of directory.
 */
export type SysFsManifestReqEvent = {
  type: 'sys.fs/manifest:req';
  payload: SysFsManifestReq;
};
export type SysFsManifestReq = { tx: string; id: FilesystemId; dir?: FilePath | FilePath[] };

export type SysFsManifestResEvent = {
  type: 'sys.fs/manifest:res';
  payload: SysFsManifestRes;
};
export type SysFsManifestRes = {
  tx: string;
  id: FilesystemId;
  dirs: SysFsManifestDirResponse[];
};
