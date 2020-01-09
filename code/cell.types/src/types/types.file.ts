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
  | 'INVALID/fileMissing' // TODO 🐷 implement on integrity object.
  | 'UNKNOWN';

export type IFileIntegrity = {
  ok: boolean | null;
  exists: boolean | null; // File verified to exist on storage media.
  status: FileIntegrityStatus;
  filehash: string;
  verifiedAt: number;
  uploadedAt: number;
  uploadExpiresAt?: number;
};

/**
 * Upload (presigned URL)
 */
export type IFileUploadUrl = {
  method: 'POST';
  expiresAt: number;
  filename: string;
  uri: string;
  url: string;
  props: { [key: string]: string };
};
