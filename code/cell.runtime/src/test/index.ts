import * as t from '../common/types';

export { t };
export { expect } from '@platform/test';
export { is } from '@platform/util.value';
export * from '../common';

import { Uri } from '@platform/cell.schema';
export const TEST_ALLOW = { NS: ['foo*'] };
Uri.ALLOW = TEST_ALLOW;
