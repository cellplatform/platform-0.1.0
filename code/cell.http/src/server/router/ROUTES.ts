export * from '../common/constants';

export const ROUTES = {
  SYS: {
    INFO: '/',
    UID: '/uid',
    WILDCARD: '*',
  },
  NS: {
    BASE: `/ns\\::id([A-Za-z0-9]*)(/?)`,
    DATA: `/ns\\::id([A-Za-z0-9]*)/data(/?)`,
  },
  CELL: {
    BASE: `/cell\\::id([A-Za-z0-9]*)\!:key([A-Z]+[0-9]+)(/?)`,
  },
  ROW: {
    BASE: `/row\\::id([A-Za-z0-9]*)\!:key([0-9]+)(/?)`,
  },
  COLUMN: {
    BASE: `/col\\::id([A-Za-z0-9]*)\!:key([A-Z]+)(/?)`,
  },
};
