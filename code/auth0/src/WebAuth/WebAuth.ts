import * as auth0 from 'auth0-js';
import { Subject } from 'rxjs';
import { share, takeUntil } from 'rxjs/operators';
import { is, t, time } from '../common';

const KEY = {
  LOGGED_IN: 'AUTH0/isLoggedIn',
};

const storage = {
  get isLoggedIn() {
    return localStorage.getItem(KEY.LOGGED_IN) === 'true';
  },
  set isLoggedIn(value: boolean) {
    if (value) {
      localStorage.setItem(KEY.LOGGED_IN, value.toString());
    } else {
      localStorage.removeItem(KEY.LOGGED_IN);
    }
  },
};

/**
 * Authentication client for web (single-page-app) using "universal login".
 * See:
 *   - https://auth0.com/docs/universal-login
 */
export class WebAuth {
  /**
   * [Static]
   */
  public static create(args: t.IWebAuthArgs) {
    return new WebAuth(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: t.IWebAuthArgs) {
    if (!is.browser) {
      throw new Error(`WebAuth only works in the browser`);
    }

    // Store fields.
    this.domain = args.domain;
    this.clientId = args.clientId;
    this.responseType = args.responseType || 'token id_token';
    this.scope = args.scope || 'openid profile';
    this.redirectUri = args.redirectUri || window.location.href;

    // Create wrapped Auth0 manager.
    this._auth0 = new auth0.WebAuth({
      domain: this.domain,
      clientID: this.clientId,
      responseType: this.responseType,
      scope: this.scope,
      redirectUri: this.redirectUri,
    });

    // Initialize.
    this._prev = this.toObject();
    if (args.initialize !== false) {
      time.delay(0, () => this.init());
    }
  }

  public async init() {
    if (this.status !== 'LOADING') {
      return;
    }
    this.fireChanged();
    if (storage.isLoggedIn) {
      await this.renewTokens({ silent: true });
    } else {
      await this.parseHash({ silent: true });
    }
    this.status = 'READY';
    this.fireChanged();
    return this;
  }

  public dispose() {
    this.status = 'DISPOSED';
    this._dispose$.next();
    this._dispose$.complete();
  }

  /**
   * [Fields]
   */

  private _auth0: auth0.WebAuth;
  private _prev!: t.IWebAuthProps;

  private readonly _dispose$ = new Subject();
  public readonly dispose$ = this._dispose$.pipe(share());

  private readonly _events$ = new Subject<t.WebAuthEvent>();
  public readonly events$ = this._events$.pipe(
    takeUntil(this.dispose$),
    share(),
  );

  public readonly domain: string;
  public readonly clientId: string;
  public readonly responseType: string;
  public readonly scope: string;
  public readonly redirectUri: string;

  public status: t.WebAuthStatus = 'LOADING';
  public expiresAt = -1;
  public tokens: t.IWebAuthTokens | undefined;
  public profile: t.IWebAuthProfile | undefined;

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  public get isReady() {
    return this.status === 'READY';
  }

  public get isLoggedIn() {
    return this.isReady ? storage.isLoggedIn && !this.isExpired : null;
  }

  public get isExpired() {
    const expiration = this.expiresAt || -1;
    return !storage.isLoggedIn || expiration < 0 ? false : new Date().getTime() > expiration;
  }

  /**
   * [Methods]
   */
  public login() {
    this.throwIfDisposed('login');
    this._auth0.authorize();
  }

  public logout(options: { force?: boolean; silent?: boolean } = {}) {
    this.throwIfDisposed('logout');
    storage.isLoggedIn = false;
    this.tokens = undefined;
    this.profile = undefined;
    this.expiresAt = -1;
    if (options.force) {
      this._auth0.logout({});
    }
    if (options.silent !== true) {
      this.fireChanged();
    }
  }

  public renewTokens(options: { silent?: boolean } = {}) {
    this.throwIfDisposed('renewTokens');
    return new Promise((resolve, reject) => {
      this._auth0.checkSession({}, async (err, auth) => {
        if (err) {
          this.logout(options);
          return reject(err);
        }
        await this.localLogin(auth, options);
        resolve();
      });
    });
  }

  public toObject(): t.IWebAuthProps {
    const tokens = this.tokens;
    const profile = this.profile;
    return {
      status: this.status,
      isReady: this.isReady,
      isLoggedIn: this.isLoggedIn,
      isExpired: this.isExpired,
      domain: this.domain,
      clientId: this.clientId,
      responseType: this.responseType,
      scope: this.scope,
      expiresAt: new Date(this.expiresAt),
      tokens: tokens ? { ...tokens } : undefined,
      profile: profile ? { ...profile } : undefined,
    };
  }

  /**
   * [Helpers]
   */
  private fire(e: t.WebAuthEvent) {
    this._events$.next(e);
  }

  private fireChanged() {
    const next = this.toObject();
    const status = this.status;
    const isLoggedIn = this.isLoggedIn;
    this.fire({
      type: 'AUTH0/WebAuth/changed',
      payload: { status, isLoggedIn, prev: this._prev, next },
    });
    this._prev = next;
  }

  private throwIfDisposed(action: string) {
    if (this.isDisposed) {
      throw new Error(`Cannot ${action} because WebAuth is disposed.`);
    }
  }

  private parseHash(options: { silent?: boolean } = {}) {
    this.throwIfDisposed('parseHash');
    return new Promise((resolve, reject) => {
      this._auth0.parseHash(async (err, auth) => {
        if (err) {
          this.logout();
          return reject(err);
        }
        await this.localLogin(auth, options);
        resolve();
      });
    });
  }

  private removeUrlHash() {
    history.pushState('', document.title, window.location.pathname + window.location.search);
  }

  private async localLogin(
    auth: auth0.Auth0DecodedHash | null,
    options: { silent?: boolean } = {},
  ) {
    // Setup initial conditions.
    if (!auth || !(auth.accessToken && auth.idToken)) {
      return false;
    }
    this.removeUrlHash();

    // Update state.
    this.expiresAt = (auth.expiresIn || 0) * 1000 + new Date().getTime();
    this.tokens = {
      accessToken: auth.accessToken,
      idToken: auth.idToken,
    };
    this.profile = await this.getProfile();

    // Finish up.
    storage.isLoggedIn = true;
    if (options.silent !== true) {
      this.fireChanged();
    }
    return true;
  }

  private getProfile() {
    this.throwIfDisposed('getProfile');
    return new Promise<t.IWebAuthProfile | undefined>((resolve, reject) => {
      if (!this.tokens) {
        return resolve(undefined);
      }
      const token = this.tokens.accessToken;
      this._auth0.client.userInfo(token, (err, result) => {
        if (err) {
          return reject(err);
        }
        const profile: t.IWebAuthProfile = {
          userId: result.sub,
          email: result.name,
          updatedAt: new Date(result.updated_at),
          avatarUrl: result.picture,
        };
        resolve(profile);
      });
    });
  }
}
