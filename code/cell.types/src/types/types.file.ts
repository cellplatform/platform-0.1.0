import { t } from '../common';

export type IFileProps = { name: string };
export type IFileData = {
  props: IFileProps;
  hash?: string;
  error?: t.IError;
};
