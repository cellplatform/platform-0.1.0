import '@platform/polyfill';
import '@platform/ui.datagrid/import.css';

import { Schema } from '@platform/cell.schema';

Schema.uri.ALLOW.NS = [...Schema.uri.ALLOW.NS, 'sys*', 'foo*'];

console.log('Schema.uri.ALLOW.NS', Schema.uri.ALLOW.NS);
