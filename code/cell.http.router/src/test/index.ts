import * as FormData from 'form-data';
export { FormData };

import { mock, createMock, IMock } from './mock';
import { Schema } from '../common';

export { mock, createMock, IMock };
export * from '../common';
export * from './util';
export * from './expect';

console.log('-------------------------------------------');

before(async () => mock.reset());
Schema.uri.ALLOW.NS = ['foo*'];

console.log('Schema.uri.ALLOW.NS', Schema.uri.ALLOW.NS);

export { Http } from '@platform/http';
