import { t } from '../common';

/**
 * Payloads
 */
export type IPayload<D> = { status: number; data: D };

export type IErrorPayload = IHttpErrorPayload | IFsHttpErrorPayload;
export type IHttpErrorPayload = IPayload<t.IHttpError>;
export type IFsHttpErrorPayload = IPayload<t.IFsHttpError>;

export type IUriResponse<D, L = IUrlMap> = {
  uri: string;
  exists: boolean;
  createdAt: number;
  modifiedAt: number;
  data: D;
  urls: L;
};

export type IUrlMap = { [key: string]: string };
