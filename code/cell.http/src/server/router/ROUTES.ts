export * from '../common/constants';

export const ROUTES = {
  SYS: {
    INFO: '/',
    CUID: '/cuid',
    WILDCARD: '*',
  },
  NS: {
    BASE: `/ns\::id([A-Za-z0-9]*)(/?)`,
    DATA: `/ns\::id([A-Za-z0-9]*)/data(/?)`,
  },
};
