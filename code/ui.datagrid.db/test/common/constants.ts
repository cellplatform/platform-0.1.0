const { app } = require('electron').remote;
const USER_DATA = app.getPath('userData');

const DB_DIR = `${USER_DATA}/db`;
export const DB = {
  DIR: DB_DIR,
  FILE: `nedb:${DB_DIR}/test.db`,
};

export const COLORS = {
  WHITE: '#fff',
  DARK: '#293042', // Inky blue/black.
};
