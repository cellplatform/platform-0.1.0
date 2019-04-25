import { t, jwt, jwksClient, axios } from './common';

export type IAccessTokenArgs = {
  token: string;
  audience: string;
  issuer: string;
  algorithms?: string[];
};

const DEFAULT = {
  ALGORITHMS: ['RS256'],
};

/**
 * Manages an access token.
 */
export class AccessToken implements t.IAccessToken {
  /**
   * [Static]
   */
  public static async create(args: IAccessTokenArgs) {
    const token = await AccessToken.decode(args);

    // TEMP 🐷 todo caching.

    return new AccessToken(args, token);
  }

  /**
   * Decodes the given token.
   */
  public static decode(args: IAccessTokenArgs) {
    return new Promise<t.IAccessToken>((resolve, reject) => {
      const { token, audience, issuer } = args;
      const algorithms = args.algorithms || DEFAULT.ALGORITHMS;
      const options = { audience, issuer, algorithms };

      // JSON web-key-set.
      const jwksUri = `${issuer.replace(/\/$/, '')}/.well-known/jwks.json`;
      const jwks = jwksClient({ jwksUri });

      // Retrieves the signing key.
      const getKey: jwt.GetPublicKeyOrSecret = (header, callback) => {
        jwks.getSigningKey(header.kid || '', (err, key) => {
          const signingKey = key.publicKey || key.rsaPublicKey;
          callback(null, signingKey);
        });
      };

      // Decode the token.
      jwt.verify(token, getKey, options, (err, decoded) => {
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
    this.algorithms = args.algorithms || DEFAULT.ALGORITHMS;
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

    const authorization = `Bearer ${this.toString()}`;
    const result = await axios.create({ headers: { Authorization: authorization } }).get(url);
    const data = result.data;

    const profile: t.IAuthProfile = {
      sub: data.sub,
      email: data.name,
      updatedAt: new Date(data.updated_at),
      picture: data.picture,
    };

    this._.profile = profile;
    return profile;
  }
}
