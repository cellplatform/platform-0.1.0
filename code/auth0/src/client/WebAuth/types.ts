import { IAuthTokens, IAuthProfile } from '../types';

export type WebAuthStatus = 'LOADING' | 'READY' | 'DISPOSED';

export type IWebAuthArgs = {
  domain: string;
  clientId: string;
  responseType?: string;
  scope?: string;
  audience?: string;
  redirectUri?: string;
  initialize?: boolean;
};

export type IWebAuthProps = {
  status: WebAuthStatus;
  isReady: boolean;
  isLoggedIn: boolean | null;
  isExpired: boolean;
  domain: string;
  clientId: string;
  responseType: string;
  scope: string;
  audience?: string;
  expiresAt?: Date;
  tokens?: IAuthTokens;
  profile?: IAuthProfile;
};

/**
 * [Events]
 */
export type WebAuthEvent = IWebAuthChangedEvent;

export type IWebAuthChangedEvent = {
  type: 'AUTH0/WebAuth/changed';
  payload: IWebAuthChange;
};
export type IWebAuthChange = {
  status: WebAuthStatus;
  isLoggedIn: IWebAuthProps['isLoggedIn'];
  prev: IWebAuthProps;
  next: IWebAuthProps;
};
