import { t } from '../common';

type O = Record<string, unknown>;
type P = t.ICellProps;

export type IHttpClientCellDb = {
  readonly uri: t.ICellUri;
  readonly props: IHttpClientCellDbProps;

  toString(): string;
  exists(): Promise<boolean>;

  read(options?: t.IReqQueryCellInfo): t.IHttpClientAsync<t.IResGetCell>;
  write<T extends P = P>(
    data: t.ICellData<T>,
    options?: t.IReqQueryNsWrite,
  ): t.IHttpClientAsync<t.IResPostNs>;
};

export type IHttpClientCellDbProps = {
  read<P extends O = O>(options?: t.IReqQueryCellInfo): t.IHttpClientAsync<P | undefined>;
  write<P extends O = O>(props: P, options?: t.IReqQueryNsWrite): t.IHttpClientAsync<t.IResPostNs>;
};
