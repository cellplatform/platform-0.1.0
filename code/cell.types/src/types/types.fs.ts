import * as s3 from '@platform/fs.s3.types';
import { IFsError } from './types.error';

export type FsType = FsTypeLocal | FsTypeS3;
export type FsTypeLocal = 'LOCAL';
export type FsTypeS3 = 'S3';

/**
 * API
 */
export type IFileSystem = IFsS3 | IFsLocal;
export type IFsLocal = IFsMembers<
  FsTypeLocal,
  IFsInfoLocal,
  IFsReadLocal,
  IFsWriteLocal,
  IFsDeleteLocal
>;
export type IFsS3 = IFsMembers<FsTypeS3, IFsInfoS3, IFsReadS3, IFsWriteS3, IFsDeleteS3> & {
  bucket: string;
};

/**
 * File-system Members
 */
type IFsMembers<
  T extends FsType,
  I extends IFsMeta,
  R extends IFsRead,
  W extends IFsWrite,
  D extends IFsDelete
> = {
  type: T;
  root: string; // Root directory of the file-system.
  resolve(uri: string, options?: IFsResolveArgs): IFsLocation;
  info(uri: string): Promise<I>;
  read(uri: string): Promise<R>;
  write(uri: string, data: Buffer, options?: { filename?: string }): Promise<W>;
  delete(uri: string | string[]): Promise<D>;
};

/**
 * File-system Location (Resolve)
 */
export type IFsLocation = {
  path: string;
  props: { [key: string]: string };
};

export type IFsResolveArgs =
  | IFsResolveDefaultArgs
  | IFsResolveSignedGetArgs
  | IFsResolveSignedPutArgs
  | IFsResolveSignedPostArgs;

export type IFsResolveDefaultArgs = { type: 'DEFAULT' };
export type IFsResolveSignedGetArgs = s3.S3SignedUrlGetObjectOptions & { type: 'SIGNED/get' };
export type IFsResolveSignedPutArgs = s3.S3SignedUrlPutObjectOptions & { type: 'SIGNED/put' };
export type IFsResolveSignedPostArgs = s3.S3SignedPostOptions & { type: 'SIGNED/post' };

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
export type IFsMetaS3 = IFsMetaCommon & { 'S3:ETAG'?: string };

/**
 * File (info + data)
 */
export type IFsFileData<I extends IFsMeta = IFsMeta> = I & { data: Buffer };

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

export type IFsInfo = IFsInfoLocal | IFsInfoS3;
export type IFsRead = IFsReadLocal | IFsReadS3;
export type IFsWrite = IFsWriteLocal | IFsWriteS3;
export type IFsDelete = IFsDeleteLocal | IFsDeleteS3;

/**
 * Local file-system (Extensions)
 */
export type IFsInfoLocal = IFsInfoCommon & IFsMetaLocal;
export type IFsReadLocal = IFsReadCommon & { file?: IFsFileData<IFsMetaLocal> };
export type IFsWriteLocal = IFsWriteCommon & { file: IFsFileData<IFsMetaLocal> };
export type IFsDeleteLocal = IFsDeleteCommon & {};

/**
 * S3 (Extensions)
 */
export type IFsInfoS3 = IFsInfoCommon & IFsMetaS3;
export type IFsReadS3 = IFsReadCommon & { file?: IFsFileData<IFsMetaS3>; 'S3:ETAG'?: string };
export type IFsWriteS3 = IFsWriteCommon & { file: IFsFileData<IFsMetaS3>; 'S3:ETAG'?: string };
export type IFsDeleteS3 = IFsDeleteCommon & {};
