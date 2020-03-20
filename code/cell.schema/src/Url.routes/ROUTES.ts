const ID = {
  NS: `([A-Za-z0-9\.]*)`,
  CELL: `([A-Z]+[0-9]+)`,
  ROW: `([0-9]+)`,
  COLUMN: `([A-Z]+)`,
  FILE: `([A-Za-z0-9]+)`,
  FILENAME: `([\-A-Za-z0-9\.\_\/]*)`,
};

const KEY = {
  NS: `\\::ns${ID.NS}`,
  CELL: `\:key${ID.CELL}`,
  ROW: `\:key${ID.ROW}`,
  COLUMN: `\:key${ID.COLUMN}`,
  FILE: `\:file${ID.FILE}`,
  FILENAME: `\:filename${ID.FILENAME}`,
};

export const ROUTES = {
  WILDCARD: '*',
  SYS: {
    FAVICON: '/favicon.ico',
    INFO: ['/', '/.sys(/?)'],
    UID: '/uid(/?)',
  },
  LOCAL: {
    FS: `/local/fs`,
  },
  FILE: {
    BASE: `/file${KEY.NS}\\:${KEY.FILE}(/?)`,
    INFO: `/file${KEY.NS}\\:${KEY.FILE}/info(/?)`,
    UPLOADED: `/file${KEY.NS}\\:${KEY.FILE}/uploaded(/?)`,
  },
  NS: {
    CELL: `/ns${KEY.NS}\\:${KEY.CELL}(/?)`, // NB: Redirect to cell.
    INFO: `/ns${KEY.NS}(/?)`,
    TYPES: `/ns${KEY.NS}/types`,
  },
  CELL: {
    NS: `/cell${KEY.NS}(/?)`, // NB: Redirect to namespace.
    INFO: `/cell${KEY.NS}\\:${KEY.CELL}(/?)`,
    FILE: {
      BY_NAME: `/cell${KEY.NS}\\:${KEY.CELL}/file/${KEY.FILENAME}`,
      BY_FILE_URI: `/cell${KEY.NS}\\:${KEY.CELL}/file\\:${KEY.FILENAME}`,
    },
    FILES: {
      BASE: `/cell${KEY.NS}\\:${KEY.CELL}/files(/?)`,
      UPLOAD: `/cell${KEY.NS}\\:${KEY.CELL}/files/upload`,
      UPLOADED: `/cell${KEY.NS}\\:${KEY.CELL}/files/uploaded`,
    },
  },
  ROW: {
    INFO: `/cell${KEY.NS}\\:${KEY.ROW}(/?)`,
  },
  COLUMN: {
    INFO: `/cell${KEY.NS}\\:${KEY.COLUMN}(/?)`,
  },
};
