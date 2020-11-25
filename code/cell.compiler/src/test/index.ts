import { Uri } from './common';

export { expect } from '@platform/test';
export { TestCompile } from './compiler/compile';
export * from './common';

export const TEST_ALLOW = { NS: ['foo*'] };
Uri.ALLOW = TEST_ALLOW;
