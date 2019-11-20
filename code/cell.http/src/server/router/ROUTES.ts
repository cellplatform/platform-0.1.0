export * from '../common/constants';

export const ROUTES = {
  SYS: {
    INFO: '/',
    WILDCARD: '*',
  },
  NS: {
    INFO: `/ns\::id([A-Za-z0-9]*)(/?)`,
    DATA: `/ns\::id([A-Za-z0-9]*)/data(/?)`,
  },
};
