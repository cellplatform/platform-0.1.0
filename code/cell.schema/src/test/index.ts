import { Uri } from '../Uri';

export { expect, expectError } from '@platform/test';
export { time } from '@platform/util.value';
export { fs } from '@platform/fs';
export * from '../common';

export const TEST_ALLOW = { NS: ['foo*'] };
Uri.ALLOW = TEST_ALLOW;
