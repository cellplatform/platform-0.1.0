import { Uri } from '../common';

export { fs } from '@platform/fs';
export { expect, expectError } from '@platform/test';

export * from '../common';
export * from './fetch';
export * from './TYPE_DEFS';

export { TypeSystem } from '..';
export { util } from '../TypeSystem/util';

export const TEST_ALLOW = { NS: ['foo*'] };
Uri.ALLOW = TEST_ALLOW;
