import { t } from '../common';

export type IHttpClientCellDb = {
  readonly uri: t.ICellUri;
  readonly url: t.IUrlsCell;
  exists(): Promise<boolean>;
  read(options?: t.IReqQueryCellInfo): t.IHttpClientAsync<t.IResGetCell>;
  toString(): string;
};
