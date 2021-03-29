export * from './client/types';
export * from './server/types';

export type IAuthTokens = {
  accessToken: string;
  idToken: string;
};

export type IAuthProfile = {
  id: string;
  email: string;
  picture: string;
  updatedAt: Date;
};

export type IAccessToken = {
  iss: string;
  sub: string;
  aud: string[];
  iat: number;
  exp: number;
  azp: string;
  scope: string;
};
