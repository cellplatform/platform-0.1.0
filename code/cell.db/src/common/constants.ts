import { PKG } from './constants.pkg';
export { PKG };

const DEPS = PKG.dependencies;
export const SCHEMA_VERSION = DEPS['@platform/cell.schema'] || '';
