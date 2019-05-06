export { IResolvers } from 'graphql-tools';

export type IContext = {
  getUser(): Promise<IUser>;
};

export type IUser = {
  email: string;
};
