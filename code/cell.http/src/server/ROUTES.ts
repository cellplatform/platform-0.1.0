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
    INFO: ['/', '/.sys'],
    UID: '/.uid',
  },
  NS: {
    BASE: `/ns${KEY.NS}(/?)`,
    DATA: `/ns${KEY.NS}/data(/?)`,
    CELL: `/ns${KEY.NS}\!${KEY.CELL}(/?)`, // NB: Redirect to cell.
  },
  CELL: {
    BASE: `/cell${KEY.NS}\!${KEY.CELL}(/?)`,
    FILES: `/cell${KEY.NS}\!${KEY.CELL}/files(/?)`,
    FILE_BY_NAME: `/cell${KEY.NS}\!${KEY.CELL}/files/${KEY.FILENAME}`,
    NS: `/cell${KEY.NS}(/?)`, // NB: Redirect to namespace.
  },
  ROW: {
    BASE: `/row${KEY.NS}\!${KEY.ROW}(/?)`,
  },
  COLUMN: {
    BASE: `/col${KEY.NS}\!${KEY.COLUMN}(/?)`,
  },
  FILE: {
    BASE: `/file${KEY.NS}\.${KEY.FILE}(/?)`,
    INFO: `/file${KEY.NS}\.${KEY.FILE}/info(/?)`,
  },
};
