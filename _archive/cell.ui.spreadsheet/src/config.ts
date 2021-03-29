import '@platform/polyfill';
import '@platform/ui.datagrid/import.css';

import { Schema } from '@platform/cell.schema';

Schema.Uri.ALLOW.NS = [...Schema.Uri.ALLOW.NS, 'sys*', 'foo*'];
