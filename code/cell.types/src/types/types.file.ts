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
  | 'INVALID/filehash'
  | 'INVALID/fileMissing'; // TODO 🐷 implement on integrity object.

export type IFileIntegrity = {
  // status: FileIntegrityStatus; // TODO 🐷
  ok: boolean | null;
  filehash: string;
  verifiedAt: number;
  uploadedAt: number;
  uploadExpiresAt: number;
};

/**
 * Upload (presigned URL)
 */
export type IFileUploadUrl = {
  filename: string;
  uri: string;
  url: string;
  props: { [key: string]: string };
  expiresAt: number;
};
