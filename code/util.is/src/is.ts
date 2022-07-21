import * as t from './types';

/**
 * Environment flags.
 */
export const Is: t.Is = {
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

  toObject(): t.IsFlags {
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
    return typeof input === 'object' && typeof input?.subscribe === 'function';
  },

  /**
   * Determine if the given input is an observable Subject.
   */
  subject(input?: any) {
    return Is.observable(input) && typeof input?.next === 'function';
  },

  /**
   * Determine if the given input is a node stream
   */
  stream(input?: any) {
    return typeof input?.on === 'function';
  },

  /**
   * Determines whether the given value is a Promise.
   */
  promise(value?: any) {
    return value ? typeof value === 'object' && typeof value.then === 'function' : false;
  },
};
