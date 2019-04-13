import { Observable, Subject, BehaviorSubject } from 'rxjs';
import {
  takeUntil,
  take,
  takeWhile,
  map,
  filter,
  share,
  delay,
  distinctUntilChanged,
  debounceTime,
} from 'rxjs/operators';
import { t, is } from '../common';

import * as auth0 from 'auth0-js';

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
    // Store fields.
    this.domain = args.domain;
    this.clientId = args.clientId;
    this.responseType = args.responseType || 'token id_token';
    this.scope = args.scope || 'openid';
    this.redirectUri = args.redirectUri || is.browser ? window.location.href : '';

    // Create wrapped Auth0 manager.
    this._client = new auth0.WebAuth({
      domain: this.domain,
      clientID: this.clientId,
      responseType: this.responseType,
      scope: this.scope,
      redirectUri: this.redirectUri,
    });
  }

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }

  /**
   * [Fields]
   */
  private readonly _dispose$ = new Subject();
  public readonly dispose$ = this._dispose$.pipe(share());

  public readonly domain: string;
  public readonly clientId: string;
  public readonly responseType: string;
  public readonly scope: string;
  public readonly redirectUri: string;

  private _client: auth0.WebAuth;

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  /**
   * [Methods]
   */
  public login() {
    this.throwIfDisposed('login');
    this._client.authorize();
  }

  /**
   * Helpers
   */
  private throwIfDisposed(action: string) {
    if (this.isDisposed) {
      throw new Error(`Cannot ${action} because WebAuth is disposed.`);
    }
  }
}
