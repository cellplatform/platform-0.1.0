import * as FormData from 'form-data';
export { FormData };

import { mock, createMock, IMock } from './mock';
import { Schema, id } from '../common';

export const slug = id.shortid;

export { mock, createMock, IMock };
export * from '../common';
export * from './util';
export * from './expect';
export * from './TYPE_DEFS';

export { Http } from '@platform/http';

before(async () => mock.reset());
Schema.uri.ALLOW.NS = ['foo*'];