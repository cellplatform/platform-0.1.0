import { t } from '../common';

type O = Record<string, unknown>;

export type IUrl<Q extends O = any> = {
  readonly origin: IUrlOrigin;
  readonly path: string;
  readonly querystring: string;
  query(input: Partial<Q>): IUrl<Q>;
  toString(options?: { origin?: boolean }): string;
};

export type IUrlOrigin = {
  readonly protocol: t.HttpProtocol;
  readonly host: string;
  readonly hostname: string;
  readonly port: number;
  toString(): string;
};
