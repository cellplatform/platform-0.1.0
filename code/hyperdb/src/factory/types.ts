import * as t from '../types';

export type CreateDatabase = <P extends {} = any>(
  args: ICreateDatabaseArgs,
) => Promise<ICreateDatabaseResponse<P>>;

export type ICreateDatabaseArgs = {
  dir: string;
  dbKey?: string;
  connect?: boolean;
  version?: string;
};

export type ICreateDatabaseResponse<P extends {} = any> = {
  db: t.IDb<P>;
  network: t.INetwork;
};
