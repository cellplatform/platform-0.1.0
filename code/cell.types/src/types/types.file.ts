import { t } from '../common';

export type IFileProps = {
  name?: string;
  mimetype?: string;
  fileHash?: string;
};
export type IFileData = {
  props: IFileProps;
  hash?: string;
  error?: t.IError;
};
