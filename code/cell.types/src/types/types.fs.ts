import * as s3 from '@platform/fs.s3.types';
import { IFileSystemError } from './types.error';

/**
 * API
 */
export type IFileSystem = IFileSystemS3 | IFileSystemLocal;
export type IFileSystemLocal = IFileSystemMembers & { type: 'LOCAL' };
export type IFileSystemS3 = IFileSystemMembers & { type: 'S3'; bucket: string };

/**
 * File-system Members
 */
export type IFileSystemMembers = {
  root: string; // Root directory of the file-system.
  resolve(uri: string, options?: IFileSystemResolveArgs): IFileSystemLocation;
  read(uri: string): Promise<IFileSystemRead>;
  write(uri: string, data: Buffer, options?: { filename?: string }): Promise<IFileSystemWrite>;
  delete(uri: string | string[]): Promise<IFileSystemDelete>;
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
 * Responses
 */
export type IFileSystemRead = {
  ok: boolean;
  status: number;
  location: string;
  file?: IFileSystemFile;
  error?: IFileSystemError;
};

export type IFileSystemWrite = {
  ok: boolean;
  status: number;
  location: string;
  file: IFileSystemFile;
  error?: IFileSystemError;
};

export type IFileSystemDelete = {
  ok: boolean;
  status: number;
  locations: string[];
  error?: IFileSystemError;
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
