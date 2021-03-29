export * from '../../src/types';
import * as t from '../../src/types';

export type IContext = {
  getToken(): Promise<t.IAccessToken | undefined>;
  getUser(): Promise<t.IAuthProfile | undefined>;
};
