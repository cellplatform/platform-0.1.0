export * from '../common/constants';

export const ROUTES = {
  SYS: {
    INFO: '/',
    WILDCARD: '*',
  },
  NS: {
    INFO: `/ns\::id([A-Z0-9]*)(/?)`,
    DATA: `/ns\::id([A-Z0-9]*)/data(/?)`,
  },
};
