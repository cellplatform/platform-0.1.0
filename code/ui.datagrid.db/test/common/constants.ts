const { app } = require('electron').remote;
const userData = app.getPath('userData');

export const DB = {
  DIR: `${userData}/db-test`,
};
