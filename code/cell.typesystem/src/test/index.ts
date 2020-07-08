import { Uri } from '../common';

export { fs } from '@platform/fs';
export { expect, expectError } from '@platform/test';
export { time } from '@platform/util.value';

export { Subject, Observable } from 'rxjs';

export * from '../common';
// export * from './fetch';
export * from './TYPE_DEFS';

import { TypeSystem } from '..';
export { TypeSystem };

export const stub = TypeSystem.fetcher.stub;

export const TEST_ALLOW = { NS: ['foo*'] };
Uri.ALLOW = TEST_ALLOW;
