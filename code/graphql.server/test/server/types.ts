export { IResolvers } from 'graphql-tools';
import { IGqlContext } from '../../src/types';

export * from '../../src/types';

export type IContext = IGqlContext & {
  getUser(): Promise<IUserProfile>;
};

export type IUserProfile = {
  email: string;
};
