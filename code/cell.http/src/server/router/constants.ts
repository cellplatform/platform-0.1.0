export * from '../common/constants';

export const ROUTES = {
  SYS: {
    INFO: '/',
    WILDCARD: '*',
  },
  NS: {
    INFO: `/ns\::id(.*)/`,
    DATA: `/ns\::id(.*)/data`,
  },
};
