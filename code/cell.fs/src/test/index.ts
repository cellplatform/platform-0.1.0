export { expect } from 'chai';

import { Schema } from '../common';
Schema.uri.ALLOW.NS = ['foo*'];
