const ID = {
  NS: `([A-Za-z0-9]*)`,
  CELL: `([A-Z]+[0-9]+)`,
  ROW: `([0-9]+)`,
  COLUMN: `([A-Z]+)`,
  FILE: `([A-Za-z0-9]+)`,
  FILENAME: `([A-Za-z0-9\.\-\_]*)`,
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
    INFO: ['/', '/.sys(/?)'],
    UID: '/.uid',
  },
  LOCAL: {
    FS: `/local/fs`,
  },
  FILE: {
    INFO: `/file${KEY.NS}\\:${KEY.FILE}/info(/?)`,
    BASE: `/file${KEY.NS}\\:${KEY.FILE}(/?)`,
    UPLOADED: `/file${KEY.NS}\\:${KEY.FILE}/uploaded(/?)`,
  },
  NS: {
    CELL: `/ns${KEY.NS}\!${KEY.CELL}(/?)`, // NB: Redirect to cell.
    INFO: `/ns${KEY.NS}(/?)`,
  },
  CELL: {
    NS: `/cell${KEY.NS}(/?)`, // NB: Redirect to namespace.
    INFO: `/cell${KEY.NS}\!${KEY.CELL}(/?)`,
    FILE_BY_INDEX: `/cell${KEY.NS}\!${KEY.CELL}/files/:index([0-9]+)`,
    FILE_BY_NAME: `/cell${KEY.NS}\!${KEY.CELL}/file/${KEY.FILENAME}`,
    FILES: `/cell${KEY.NS}\!${KEY.CELL}/files(/?)`,
    // FILES: {} todo
  },
  ROW: {
    INFO: `/cell${KEY.NS}\!${KEY.ROW}(/?)`,
  },
  COLUMN: {
    INFO: `/cell${KEY.NS}\!${KEY.COLUMN}(/?)`,
  },
};
