export { ERROR } from '@platform/cell.schema';

type Pkg = { name: string; version: string; dependencies: { [key: string]: string } };

const pkg = require('../../package.json') as Pkg;
const toVersion = (key: string) => (pkg.dependencies || {})[key];

export const VERSION = {
  '@platform/cell.schema': toVersion('@platform/cell.schema'),
};

console.log('VERSION', VERSION);
console.log('TODO: put schema version as "cell-os:schema" on http headers for all calls');
