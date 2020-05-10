import '@platform/polyfill';
import { Schema } from '@platform/cell.schema';

Schema.uri.ALLOW.NS = [...Schema.uri.ALLOW.NS, 'sys*'];
