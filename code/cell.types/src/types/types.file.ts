import { t } from '../common';

export type IFileProps = {
  filename?: string;
  filehash?: string;
  mimetype?: string;
  location?: string;
  bytes?: number;
  verification?: IFileVerification;
};
export type IFileData = {
  props: IFileProps;
  hash?: string;
  error?: t.IError;
};

export type IFileVerification = {
  isValid: boolean;
  verifiedAt?: number;
};
