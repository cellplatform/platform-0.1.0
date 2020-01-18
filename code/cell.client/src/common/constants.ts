export { ERROR } from '@platform/cell.schema';

type Pkg = { name: string; version: string; dependencies: { [key: string]: string } };
const pkg = require('../../package.json') as Pkg;
const toVersion = (key: string) => (pkg.dependencies || {})[key];

export const VERSION = {
  '@platform/cell.client': pkg.version,
  '@platform/cell.schema': toVersion('@platform/cell.schema'),
};
