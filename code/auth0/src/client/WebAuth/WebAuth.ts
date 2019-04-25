import * as auth0 from 'auth0-js';
import { Subject, interval } from 'rxjs';
import { map, share, takeUntil, filter } from 'rxjs/operators';
import { is, t, time, R } from '../common';

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
    this.audience = args.audience;
    this.redirectUri = args.redirectUri || window.location.href;

    // Create wrapped Auth0 manager.
    this._auth0 = new auth0.WebAuth({
      domain: this.domain,
      clientID: this.clientId,
      responseType: this.responseType,
      scope: this.scope,
      redirectUri: this.redirectUri,
      audience: this.audience,
    });

    // Initialize.
    this._prevProps = this.toObject();
    if (args.initialize !== false) {
      time.delay(0, () => {
        this.init();
        this.monitor();
      });
    }
  }

  public async init(options: { force?: boolean } = {}) {
    if (!options.force && this.status !== 'LOADING') {
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

  private monitor() {
    let prev = Boolean(this.isLoggedIn);
    this._stopMonitor$.next();
    interval(500)
      .pipe(
        takeUntil(this.dispose$),
        takeUntil(this._stopMonitor$),
        filter(() => this.isReady),
        filter(() => Boolean(storage.isLoggedIn) !== prev),
      )
      .subscribe(async () => {
        if (this.isLoggedIn) {
          this.init({ force: true });
        } else {
          this.logout();
        }
        prev = Boolean(this.isLoggedIn);
      });
  }

  public dispose() {
    this.status = 'DISPOSED';
    this._dispose$.next();
    this._dispose$.complete();
    this._stopMonitor$.next();
    this._stopMonitor$.complete();
  }

  /**
   * [Fields]
   */

  private _auth0: auth0.WebAuth;
  private _prevChange: t.IWebAuthChange | undefined;
  private _prevProps!: t.IWebAuthProps;
  private _stopMonitor$ = new Subject();

  private readonly _dispose$ = new Subject();
  public readonly dispose$ = this._dispose$.pipe(share());

  private readonly _events$ = new Subject<t.WebAuthEvent>();
  public readonly events$ = this._events$.pipe(
    takeUntil(this.dispose$),
    share(),
  );
  public readonly changed$ = this.events$.pipe(
    filter(e => e.type === 'AUTH0/WebAuth/changed'),
    map(e => e.payload as t.IWebAuthChange),
    share(),
  );

  public readonly domain: string;
  public readonly clientId: string;
  public readonly responseType: string;
  public readonly scope: string;
  public readonly audience: string | undefined;
  public readonly redirectUri: string;

  public status: t.WebAuthStatus = 'LOADING';
  public expiresAt = -1;
  public tokens: t.IAuthTokens | undefined;
  public profile: t.IAuthProfile | undefined;

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
    const expiresAt = this.expiresAt;
    return {
      status: this.status,
      isReady: this.isReady,
      isLoggedIn: this.isLoggedIn,
      isExpired: this.isExpired,
      domain: this.domain,
      clientId: this.clientId,
      responseType: this.responseType,
      scope: this.scope,
      audience: this.audience,
      expiresAt: expiresAt > -1 ? new Date(this.expiresAt) : undefined,
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

  private fireChanged(options: { force?: boolean } = {}) {
    const status = this.status;
    const isLoggedIn = this.isLoggedIn;
    const next = this.toObject();
    const prev = this._prevProps;
    const payload: t.IWebAuthChange = { status, isLoggedIn, prev, next };
    if (!options.force && R.equals(this._prevChange, payload)) {
      return;
    }
    this.fire({ type: 'AUTH0/WebAuth/changed', payload });
    this._prevProps = next;
    this._prevChange = payload;
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
    return new Promise<t.IAuthProfile | undefined>((resolve, reject) => {
      if (!this.tokens) {
        return resolve(undefined);
      }
      const token = this.tokens.accessToken;
      this._auth0.client.userInfo(token, (err, result) => {
        if (err) {
          return reject(err);
        }
        const profile: t.IAuthProfile = {
          sub: result.sub,
          email: result.name,
          updatedAt: new Date(result.updated_at),
          picture: result.picture,
        };
        resolve(profile);
      });
    });
  }
}
