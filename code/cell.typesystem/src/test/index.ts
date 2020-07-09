import { Uri } from '../common';

export { fs } from '@platform/fs';
export { expect, expectError } from '@platform/test';
export { time } from '@platform/util.value';

export { Subject, Observable } from 'rxjs';

export * from '../common';
export * from './TYPE_DEFS';

import { TypeSystem } from '..';
export { TypeSystem };
export const stub = TypeSystem.fetcher.stub;

Uri.ALLOW = { NS: ['foo*'] };
