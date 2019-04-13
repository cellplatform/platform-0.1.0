export type WebAuthStatus = 'LOADING' | 'READY' | 'DISPOSED';

export type IWebAuthArgs = {
  domain: string;
  clientId: string;
  responseType?: string;
  scope?: string;
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
  expiresAt: Date;
  tokens?: IWebAuthTokens;
  profile?: IWebAuthProfile;
};

export type IWebAuthTokens = {
  accessToken: string;
  idToken: string;
};

export type IWebAuthProfile = {
  userId: string;
  email: string;
  avatarUrl: string;
  updatedAt: Date;
};

/**
 * [Events]
 */
export type WebAuthEvent = IWebAuthChangedEvent;

export type IWebAuthChangedEvent = {
  type: 'AUTH0/WebAuth/changed';
  payload: IWebAuthChanged;
};
export type IWebAuthChanged = {
  status: WebAuthStatus;
  isLoggedIn: IWebAuthProps['isLoggedIn'];
  prev: IWebAuthProps;
  next: IWebAuthProps;
};
