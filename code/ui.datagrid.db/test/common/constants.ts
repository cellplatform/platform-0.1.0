const { app } = require('electron').remote;
const userData = app.getPath('userData');

export const DB = {
  DIR: `${userData}/db-test`,
};

export const COLORS = {
  WHITE: '#fff',
  DARK: '#293042', // Inky blue/black.
};
