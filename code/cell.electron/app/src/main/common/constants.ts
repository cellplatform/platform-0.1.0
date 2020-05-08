export * from '../../common/constants';
export * from './constants.paths';

/**
 * Environment.
 */
export const ENV = {
  get node() {
    return process.env.NODE_ENV;
  },
  get isDev() {
    return ENV.node === 'development';
  },
  get isProd() {
    return ENV.node === 'production';
  },
};

/**
 * Window Management.
 */
export const SYS = {
  KIND: {
    IDE: 'code.ide',
  },
  ROOT: {
    TYPE: 'ns:sys.app.type',
    DATA: 'ns:sys.app',
  },
  NS: {
    APP: 'ns:sys.app',
    TYPE: {
      APP: 'ns:sys.app.type',
      WINDOW: 'ns:sys.window.type',
      WINDOW_DEF: 'ns:sys.windowDef.type',
    },
  },
};
