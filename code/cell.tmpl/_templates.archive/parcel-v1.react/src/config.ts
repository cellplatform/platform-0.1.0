import '@platform/polyfill';
import { Schema } from '@platform/cell.schema';

Schema.Uri.ALLOW.NS = [...Schema.Uri.ALLOW.NS, 'sys*'];
