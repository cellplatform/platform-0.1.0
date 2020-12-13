import * as t from '../types';

export { t };
export { expect } from '@platform/test';

import { Uri } from '@platform/cell.schema';
export const TEST_ALLOW = { NS: ['foo*'] };
Uri.ALLOW = TEST_ALLOW;
