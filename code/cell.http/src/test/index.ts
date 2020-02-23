import * as FormData from 'form-data';
export { FormData };

import { mock, createMock, IMock } from './mock';
import { Schema } from '../server/common';

export { mock, createMock, IMock };
export * from '../server/common';
export * from './util';
export * from './expect';

before(async () => mock.reset());
Schema.uri.ALLOW.NS = ['foo*'];
