export { ERROR } from '@platform/cell.schema';

import { PKG } from './constants.pkg';
export { PKG };

const toVersion = (key: string) => PKG.dependencies[key];

export const VERSION = {
  '@platform/cell.client': PKG.version,
  '@platform/cell.schema': toVersion('@platform/cell.schema'),
};
