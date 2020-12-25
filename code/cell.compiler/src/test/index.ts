import { Uri } from './common';

export { expect, expectError } from '@platform/test';
export * from './common';
export * from './test.bundles';

export const TEST_ALLOW = { NS: ['foo*'] };
Uri.ALLOW = TEST_ALLOW;
