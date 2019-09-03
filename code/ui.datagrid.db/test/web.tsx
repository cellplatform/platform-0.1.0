import { NeDb } from '@platform/fsdb.nedb';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { log } from './common';

import { Test } from './components/Test';

const filename = 'tmp/datagrid.db.test';
const db = NeDb.create({ filename });

log.group('Database');
log.info('filename:', filename, '(localstorage)');
log.info('db:', db);
log.groupEnd();

ReactDOM.render(<Test db={db} />, document.getElementById('root'));
