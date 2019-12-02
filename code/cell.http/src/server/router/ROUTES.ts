export const ROUTES = {
  SYS: {
    INFO: ['/', '/.info'],
    UID: '/uid',
    WILDCARD: '*',
  },
  NS: {
    BASE: `/ns\\::id([A-Za-z0-9]*)(/?)`,
    DATA: `/ns\\::id([A-Za-z0-9]*)/data(/?)`,
  },
  CELL: {
    BASE: `/cell\\::ns([A-Za-z0-9]*)\!:key([A-Z]+[0-9]+)(/?)`,
    FILES: {
      BASE: `/cell\\::ns([A-Za-z0-9]*)\!:key([A-Z]+[0-9]+)/files(/?)`,
    },
    FILE: {
      BY_NAME: `/cell\\::ns([A-Za-z0-9]*)\!:key([A-Z]+[0-9]+)/files/:filename([A-Za-z0-9\.\-\_]*)`,
    },
  },
  ROW: {
    BASE: `/row\\::ns([A-Za-z0-9]*)\!:key([0-9]+)(/?)`,
  },
  COLUMN: {
    BASE: `/col\\::ns([A-Za-z0-9]*)\!:key([A-Z]+)(/?)`,
  },
  FILE: {
    BASE: `/file\\::ns([A-Za-z0-9]*)\.:file([A-Za-z0-9]+)(/?)`,
    INFO: `/file\\::ns([A-Za-z0-9]*)\.:file([A-Za-z0-9]+)/info(/?)`,
  },
};
