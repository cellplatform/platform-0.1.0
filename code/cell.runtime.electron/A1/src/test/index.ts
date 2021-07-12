import { Uri } from '../main/common';

export { expect, expectError } from '@platform/test';

export * from './Mock';
export * from '../main/common';
export * from './TestSample';

export const TEST_ALLOW = { NS: ['foo*'] };
Uri.ALLOW = TEST_ALLOW;
