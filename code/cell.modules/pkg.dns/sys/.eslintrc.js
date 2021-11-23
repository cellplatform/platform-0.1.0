const fs = require('@platform/fs').fs; // eslint-disable-line

const PATH = {
  local: fs.resolve('./node_modules/@platform/ts.libs/lint.js'),
  workspace: '../../config/lint.js',
};

module.exports = {
  extends: fs.pathExistsSync(PATH.workspace) ? PATH.workspace : PATH.local,
  rules: {
    'no-console': 0,
    '@typescript-eslint/no-unused-vars': 0,
  },
};
