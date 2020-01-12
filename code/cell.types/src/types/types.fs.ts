import * as s3 from '@platform/fs.s3.types';
import { IFileSystemError } from './types.error';

export type FileSystemType = FileSystemTypeLocal | FileSystemTypeS3;
export type FileSystemTypeLocal = 'LOCAL';
export type FileSystemTypeS3 = 'S3';

/**
 * API
 */
export type IFileSystem = IFileSystemS3 | IFileSystemLocal;
export type IFileSystemLocal = IFileSystemMembers & { type: FileSystemTypeLocal };
export type IFileSystemS3 = IFileSystemMembers & { type: FileSystemTypeS3; bucket: string };

/**
 * File-system Members
 */
export type IFileSystemMembers = {
  root: string; // Root directory of the file-system.
  resolve(uri: string, options?: IFileSystemResolveArgs): IFileSystemLocation;
  read(uri: string): Promise<IFileSystemReadCommon>;
  write(
    uri: string,
    data: Buffer,
    options?: { filename?: string },
  ): Promise<IFileSystemWriteCommon>;
  delete(uri: string | string[]): Promise<IFileSystemDeleteCommon>;
};

/**
 * File-system Location (Resolve)
 */
export type IFileSystemLocation = {
  path: string;
  props: { [key: string]: string };
};

export type IFileSystemResolveArgs =
  | IFileSystemResolveDefaultArgs
  | IFileSystemResolveSignedGetArgs
  | IFileSystemResolveSignedPutArgs
  | IFileSystemResolveSignedPostArgs;

export type IFileSystemResolveDefaultArgs = {
  type: 'DEFAULT';
};

export type IFileSystemResolveSignedGetArgs = s3.S3SignedUrlGetObjectOptions & {
  type: 'SIGNED/get';
};

export type IFileSystemResolveSignedPutArgs = s3.S3SignedUrlPutObjectOptions & {
  type: 'SIGNED/put';
};

export type IFileSystemResolveSignedPostArgs = s3.S3SignedPostOptions & {
  type: 'SIGNED/post';
};

/**
 * File
 */
export type IFileSystemFile = {
  uri: string;
  path: string;
  hash: string;
  data: Buffer;
  bytes: number;
};

/**
 * Method Responses
 */
type IFileSystemReadCommon = {
  ok: boolean;
  status: number;
  location: string;
  file?: IFileSystemFile;
  error?: IFileSystemError;
};

type IFileSystemWriteCommon = {
  ok: boolean;
  status: number;
  location: string;
  file: IFileSystemFile;
  error?: IFileSystemError;
};

type IFileSystemDeleteCommon = {
  ok: boolean;
  status: number;
  locations: string[];
  error?: IFileSystemError;
};

export type IFileSystemRead = IFileSystemReadLocal | IFileSystemReadS3;
export type IFileSystemWrite = IFileSystemWriteLocal | IFileSystemWriteS3;
export type IFileSystemDelete = IFileSystemDeleteLocal | IFileSystemDeleteS3;

/**
 * Local file-system (Extensions)
 */
export type IFileSystemReadLocal = IFileSystemReadCommon & {};
export type IFileSystemWriteLocal = IFileSystemWriteCommon & {};
export type IFileSystemDeleteLocal = IFileSystemDeleteCommon & {};

/**
 * S3 (Extensions)
 */
export type IFileSystemReadS3 = IFileSystemReadCommon & { 'S3:ETAG'?: string };
export type IFileSystemWriteS3 = IFileSystemWriteCommon & { 'S3:ETAG'?: string };
export type IFileSystemDeleteS3 = IFileSystemDeleteCommon & {};
