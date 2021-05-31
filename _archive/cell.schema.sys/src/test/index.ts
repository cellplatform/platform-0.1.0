import { fs } from '@platform/fs';
import { expect } from 'chai';

export { expect, fs };
export * from '../common';

export { stub } from './stub';

import { Uri } from '../common';
Uri.ALLOW = { NS: ['foo*'] };
