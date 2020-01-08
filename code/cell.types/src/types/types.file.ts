import { t } from '../common';

export type IFileProps = {
  filename?: string;
  filehash?: string;
  mimetype?: string;
  location?: string;
  bytes?: number;
};
export type IFileData = {
  props: IFileProps;
  hash?: string;
  error?: t.IError;
};
