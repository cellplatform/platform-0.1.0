export type IsFlags = {
  nodeEnv: 'development' | 'production' | 'browser' | string;
  browser: boolean;
  dev: boolean;
  prod: boolean;
  test: boolean;
};

export type IsMethods = {
  toObject(): IsFlags;
  observable(input?: any): boolean;
  stream(input?: any): boolean;
};

export type Is = IsFlags & IsMethods;

/**
 * Environment flags.
 */
export const is: Is = {
  get nodeEnv() {
    return this.browser ? 'browser' : process.env.NODE_ENV || 'development';
  },

  get browser() {
    return typeof window !== 'undefined';
  },

  get dev() {
    const env = this.nodeEnv;
    return this.browser
      ? window && window.location.hostname === 'localhost'
      : env !== 'production' && env !== 'prod';
  },

  get prod() {
    return !this.dev;
  },

  get test() {
    return this.nodeEnv === 'test';
  },

  toObject(): IsFlags {
    return {
      nodeEnv: this.nodeEnv,
      browser: this.browser,
      dev: this.dev,
      prod: this.prod,
      test: this.test,
    };
  },

  /**
   * Determine if the given input is an Observable.
   */
  observable(input?: any) {
    return typeof input?.subscribe === 'function';
  },

  /**
   * Determine if the given input is a node stream
   */
  stream(input?: any) {
    return typeof input?.on === 'function';
  },
};
