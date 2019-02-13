export type IFlags = {
  nodeEnv: 'development' | 'production' | 'browser' | string;
  browser: boolean;
  dev: boolean;
  prod: boolean;
  test: boolean;
};

export type IIs = IFlags & {
  toObject: () => IFlags;
};

/**
 * Environment flags.
 */
class Is implements IIs {
  public get nodeEnv() {
    return this.browser ? 'browser' : process.env.NODE_ENV || 'development';
  }

  public get browser() {
    return typeof window !== 'undefined';
  }

  public get dev() {
    const env = this.nodeEnv;
    return this.browser
      ? window && window.location.hostname === 'localhost'
      : env !== 'production' && env !== 'prod';
  }

  public get prod() {
    return !this.dev;
  }

  public get test() {
    return this.nodeEnv === 'test';
  }

  public toObject(): IFlags {
    return {
      nodeEnv: this.nodeEnv,
      browser: this.browser,
      dev: this.dev,
      prod: this.prod,
      test: this.test,
    };
  }
}

/**
 * Singleton
 */
export const is = new Is() as IIs;
