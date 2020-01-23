import { timer, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { jwksClient, jwt, str, t, http } from './common';

const SEC = 1000;
const MIN = SEC * 60;
const HOUR = MIN * 60;

export type IAccessTokenArgs = {
  token: string;
  audience: string;
  issuer: string;
  algorithms: jwt.Algorithm[];
};

export type IAccessTokenOptions = {
  cache?: boolean;
};

const toCacheKey = (args: IAccessTokenArgs) => {
  const { token, audience, issuer, algorithms } = args;
  const text = `${token}:${audience}:${issuer}:${algorithms}`;
  return str.hashCode(text);
};

const CACHE: { [key: string]: { token: AccessToken; expire$: Subject<{}> } } = {};

/**
 * Manages an access token.
 */
export class AccessToken implements t.IAccessToken {
  /**
   * [Static]
   */
  public static async create(args: IAccessTokenArgs & IAccessTokenOptions) {
    // Check cache.
    const useCache = args.cache === undefined ? true : args.cache;
    const key = useCache ? toCacheKey(args) : '';
    if (useCache && CACHE[key]) {
      CACHE[key].expire$.next();
      return CACHE[key].token;
    }

    // Create the token.
    const token = await AccessToken.decode(args);
    const result = new AccessToken(args, token);

    // Manage the cache.
    if (useCache) {
      const maxAge = 5 * MIN;
      const timeout = SEC * 30;

      const expire$ = new Subject<{}>();
      CACHE[key] = { token: result, expire$ };

      const removeFromCache = () => {
        expire$.complete();
        delete CACHE[key];
      };

      // Incremental access to the item keeps the item in the cache,
      // until the max-age forces a re-parsing of the token.
      expire$.pipe(debounceTime(timeout)).subscribe(() => removeFromCache());
      expire$.next(); // Start the timer.
      timer(maxAge).subscribe(() => removeFromCache()); // Force expire after max-age.
    }

    // Finish up.
    return result;
  }

  /**
   * Decodes the given token.
   */
  public static decode(args: IAccessTokenArgs & IAccessTokenOptions) {
    return new Promise<t.IAccessToken>((resolve, reject) => {
      const { token, audience, issuer, algorithms } = args;

      // JSON web-key-set.
      const jwksUri = `${issuer.replace(/\/$/, '')}/.well-known/jwks.json`;
      const jwks = jwksClient({
        jwksUri,
        strictSsl: true,
        cache: true,
        rateLimit: true, // To prevent attackers to send many random values (brute force attack).
        jwksRequestsPerMinute: 10,
        cacheMaxEntries: 50,
        cacheMaxAge: 10 * HOUR,
      });

      // Retrieves the signing key.
      type Key = { publicKey?: string; rsaPublicKey?: string };
      const getKey: jwt.GetPublicKeyOrSecret = (header, callback) => {
        jwks.getSigningKey(header.kid || '', (err, key: Key) => {
          const signingKey = key.publicKey || key.rsaPublicKey;
          if (!signingKey) {
            throw new Error(`Failed to decode JWT. A signing-key could not be found.`);
          }
          callback(null, signingKey);
        });
      };

      // Decode the token.
      jwt.verify(token, getKey, { audience, issuer, algorithms }, (err, decoded) => {
        if (err) {
          return reject(err);
        }
        if (typeof decoded === 'string') {
          throw new Error(`The token was not decoded as an object. Result: '${decoded}'.`);
        }
        resolve(decoded as t.IAccessToken);
      });
    });
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IAccessTokenArgs, token: t.IAccessToken) {
    this._.token = args.token;

    // Token fields.
    this.iss = token.iss;
    this.sub = token.sub;
    this.aud = token.aud;
    this.iat = token.iat;
    this.exp = token.exp;
    this.azp = token.azp;
    this.scope = token.scope;

    // Context.
    this.audience = args.audience;
    this.issuer = args.issuer;
    this.algorithms = args.algorithms;
  }

  /**
   * [Fields]
   */
  public readonly iss: string;
  public readonly sub: string;
  public readonly aud: string[];
  public readonly iat: number;
  public readonly exp: number;
  public readonly azp: string;
  public readonly scope: string;

  public readonly audience: string;
  public readonly issuer: string;
  public readonly algorithms: string[];

  private _ = {
    token: '',
    profile: undefined as undefined | t.IAuthProfile,
  };

  /**
   * [Methods]
   */
  public toString() {
    return this._.token;
  }

  public toObject(): t.IAccessToken {
    return {
      iss: this.iss,
      sub: this.sub,
      aud: this.aud,
      iat: this.iat,
      exp: this.exp,
      azp: this.azp,
      scope: this.scope,
    };
  }

  public async getProfile() {
    if (this._.profile) {
      return this._.profile;
    }

    const url = this.aud.find(url => url.endsWith('/userinfo'));
    if (!url) {
      throw new Error(`Cannot get user-info. The token did not contain a /userinfo URL.`);
    }

    const Authorization = `Bearer ${this.toString()}`;
    const result = await http.get(url, { headers: { Authorization } });
    const data = result.json as any;

    const profile: t.IAuthProfile = {
      id: data.sub,
      email: data.name,
      updatedAt: new Date(data.updated_at),
      picture: data.picture,
    };

    this._.profile = profile;
    return profile;
  }
}
