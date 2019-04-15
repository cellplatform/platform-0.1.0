// export * from '../../src/common/constants';

// export const DB = {
//   DIR: '.dev/db',
// };

export * from '../../src/common/constants';

const { app } = require('electron').remote;
const userData = app.getPath('userData');

export const DB = {
  // DIR: '.dev/db-test',
  DIR: `${userData}/db-test`,
};
