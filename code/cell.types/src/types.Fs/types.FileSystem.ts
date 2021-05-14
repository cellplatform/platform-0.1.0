import { IFsError } from '../types.Error';
import { t } from '../common';

type EmptyObject = Record<string, undefined>; // 🐷 NB: Used as a placeholder object.

export type FsType = FsTypeLocal | FsTypeS3;
export type FsTypeLocal = 'LOCAL';
export type FsTypeS3 = 'S3';

export type FsS3Permission = 'private' | 'public-read';

/**
 * API
 */
export type IFileSystem = IFsS3 | IFsLocal;
export type IFsLocal = IFsMembers<
  FsTypeLocal,
  IFsInfoLocal,
  IFsReadLocal,
  IFsWriteLocal,
  IFsWriteOptionsLocal,
  IFsDeleteLocal,
  IFsCopyLocal,
  IFsCopyOptionsLocal,
  IFsResolveOptionsLocal
>;
export type IFsS3 = IFsMembers<
  FsTypeS3,
  IFsInfoS3,
  IFsReadS3,
  IFsWriteS3,
  IFsWriteOptionsS3,
  IFsDeleteS3,
  IFsCopyS3,
  IFsCopyOptionsS3,
  IFsResolveOptionsS3
> & {
  bucket: string;
  endpoint: t.S3Endpoint;
};

export type IFsWriteOptions = IFsWriteOptionsLocal | IFsWriteOptionsS3;
export type IFsWriteOptionsLocal = { filename?: string };
export type IFsWriteOptionsS3 = { filename?: string; permission?: FsS3Permission };

export type IFsCopyOptions = IFsCopyOptionsLocal | IFsCopyOptionsS3;
export type IFsCopyOptionsLocal = EmptyObject; // 🐷 No option parameters.
export type IFsCopyOptionsS3 = { permission?: FsS3Permission };

/**
 * File-system Members
 */
type IFsMembers<
  Type extends FsType,
  Info extends IFsMeta,
  Read extends IFsRead,
  Write extends IFsWrite,
  WriteOptions extends IFsWriteOptions,
  Delete extends IFsDelete,
  Copy extends IFsCopy,
  CopyOptions extends IFsCopyOptions,
  ResolveOptions extends IFsResolveOptions,
> = {
  type: Type;
  dir: string; // Root directory of the file-system.
  resolve(uri: string, options?: ResolveOptions): IFsLocation;
  info(uri: string): Promise<Info>;
  read(uri: string): Promise<Read>;
  write(uri: string, data: Uint8Array, options?: WriteOptions): Promise<Write>;
  delete(uri: string | string[]): Promise<Delete>;
  copy(sourceUri: string, targetUri: string, options?: CopyOptions): Promise<Copy>;
};

/**
 * File-system Location (Resolve)
 */
export type IFsLocation = {
  path: string;
  props: { [key: string]: string };
};

export type IFsResolveOptions = IFsResolveOptionsLocal | IFsResolveOptionsS3;

export type IFsResolveOptionsLocal = IFsResolveOptionsS3; // NB: the local file-system simulates the S3 post.

export type IFsResolveOptionsS3 =
  | IFsResolveDefaultOptionsS3
  | IFsResolveSignedGetOptionsS3
  | IFsResolveSignedPutOptionsS3
  | IFsResolveSignedPostOptionsS3;

export type IFsResolveDefaultOptionsS3 = { type: 'DEFAULT'; endpoint?: t.S3EndpointKind };
export type IFsResolveSignedGetOptionsS3 = t.S3SignedUrlGetObjectOptions & {
  type: 'SIGNED/get';
  endpoint?: t.S3EndpointKind;
};
export type IFsResolveSignedPutOptionsS3 = t.S3SignedUrlPutObjectOptions & { type: 'SIGNED/put' };
export type IFsResolveSignedPostOptionsS3 = t.S3SignedPostOptions & { type: 'SIGNED/post' };

/**
 * File (meta/info)
 */
type IFsMetaCommon = {
  path: string;
  location: string;
  hash: string;
  bytes: number;
};
export type IFsMeta = IFsMetaLocal | IFsMetaS3;
export type IFsMetaLocal = IFsMetaCommon;
export type IFsMetaS3 = IFsMetaCommon & { 's3:etag'?: string; 's3:permission'?: t.FsS3Permission };

/**
 * File (info + data)
 */
export type IFsFileData<I extends IFsMeta = IFsMeta> = I & { data: Uint8Array };

/**
 * Method Responses
 */
type IFsInfoCommon = {
  uri: string;
  exists: boolean;
};

type IFsReadCommon = {
  uri: string;
  ok: boolean;
  status: number;
  error?: IFsError;
};

type IFsWriteCommon = {
  uri: string;
  ok: boolean;
  status: number;
  error?: IFsError;
};

type IFsDeleteCommon = {
  ok: boolean;
  status: number;
  uris: string[];
  locations: string[];
  error?: IFsError;
};

type IFsCopyCommon = {
  ok: boolean;
  status: number;
  error?: IFsError;
  source: string;
  target: string;
};

export type IFsInfo = IFsInfoLocal | IFsInfoS3;
export type IFsRead = IFsReadLocal | IFsReadS3;
export type IFsWrite = IFsWriteLocal | IFsWriteS3;
export type IFsDelete = IFsDeleteLocal | IFsDeleteS3;
export type IFsCopy = IFsCopyLocal | IFsCopyS3;

/**
 * Local file-system (Extensions)
 */
export type IFsInfoLocal = IFsInfoCommon & IFsMetaLocal;
export type IFsReadLocal = IFsReadCommon & { file?: IFsFileData<IFsMetaLocal> };
export type IFsWriteLocal = IFsWriteCommon & { file: IFsFileData<IFsMetaLocal> };
export type IFsDeleteLocal = IFsDeleteCommon;
export type IFsCopyLocal = IFsCopyCommon;

/**
 * S3 (Extensions)
 */
export type IFsInfoS3 = IFsInfoCommon & IFsMetaS3;
export type IFsReadS3 = IFsReadCommon & {
  file?: IFsFileData<IFsMetaS3>;
  's3:etag'?: string;
  's3:permission'?: t.FsS3Permission;
};
export type IFsWriteS3 = IFsWriteCommon & {
  file: IFsFileData<IFsMetaS3>;
  's3:etag'?: string;
  's3:permission'?: t.FsS3Permission;
};
export type IFsDeleteS3 = IFsDeleteCommon;
export type IFsCopyS3 = IFsCopyCommon;
