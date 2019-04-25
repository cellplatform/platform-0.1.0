export * from './WebAuth/types';

export type IAuthTokens = {
  accessToken: string;
  idToken: string;
};

export type IAuthProfile = {
  sub: string;
  email: string;
  picture: string;
  updatedAt: Date;
};
