type Package = {
  name: string;
  version: string;
  dependencies: { [key: string]: string };
};

export const PKG = require('../../../package.json') as Package;


