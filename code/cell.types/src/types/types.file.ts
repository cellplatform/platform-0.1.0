import { t } from '../common';

export type IFileData = {
  props: IFileProps;
  hash?: string;
  error?: t.IError;
};
export type IFileProps = {
  mimetype?: string;
  location?: string;
  bytes?: number;
  integrity?: IFileIntegrity;
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

/**
 * Parsed properties of a file linked to a cell.
 */
export type IFileLink = {
  uri: string;
  key: string;
  value: string;
  hash?: string;
  status?: string;
  file: {
    ns: string;
    id: string;
    path: string;
    dir: string;
    filename: string;
    ext: string;
  };
};
