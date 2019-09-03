import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Test } from './components/Test';

import { NeDb } from '@platform/fsdb.nedb';

const db = NeDb.create({ filename: 'tmp/client.doc.db' });

console.log('db', db);

/**
 * [Web] entry-point.
 *
 * Reference your component(s) here or pull in the [UIHarness]
 * visual testing host.
 */
ReactDOM.render(<Test db={db} />, document.getElementById('root'));
