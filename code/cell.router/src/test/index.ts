import * as FormData from 'form-data';
export { FormData };

import { RouterMock, IRouterMock } from './RouterMock';
import { Schema, id } from '../common';

export { is } from '@platform/util.is';
export { RouterMock, IRouterMock };

export const slug = id.shortid;

export * from '../common';
export * from './util';
export * from './expect';
export * from './TYPE_DEFS';
export * from './TestCompile';

export { Http } from '@platform/http';

before(async () => RouterMock.reset());
Schema.Uri.ALLOW.NS = ['foo*'];
