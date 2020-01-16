import { t } from '../common';

export type IFileProps = {
  filename?: string;
  mimetype?: string;
  location?: string;
  bytes?: number;
  integrity?: IFileIntegrity;
};
export type IFileData = {
  props: IFileProps;
  hash?: string;
  error?: t.IError;
};

/**
 * File integrity (verification)
 */
export type FileIntegrityStatus =
  | 'UPLOADING'
  | 'VALID'
  | 'INVALID'
  | 'INVALID/fileMissing' // TODO 🐷 implement on integrity object.
  | 'INVALID/filehash'
  | 'INVALID/s3:etag';

export type IFileIntegrity = {
  status: FileIntegrityStatus;
  uploadedAt?: number;
  filehash?: string;
  's3:etag'?: string;
};

/**
 * Upload (presigned URL)
 */
export type IFilePresignedUploadUrl = {
  method: 'POST';
  expiresAt: number;
  filename: string;
  uri: string;
  url: string;
  props: { [key: string]: string };
};
