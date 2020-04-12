import '@platform/polyfill';
import { Schema } from './common';

Schema.uri.ALLOW.NS = [...Schema.uri.ALLOW.NS, 'sys*'];
