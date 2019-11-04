import { t } from './common';

export type IResNs = {
  uri: string;
  exists: boolean;
  createdAt: number;
  modifiedAt: number;
  hash: string;
};

export type IResNsData = IResNs & {
  data: t.INsData;
};

export type IReqNsData = {
  data?: Partial<t.INsData>;
};
