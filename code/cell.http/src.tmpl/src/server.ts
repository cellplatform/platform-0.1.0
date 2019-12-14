import { server, util } from './common';
import { NeDb } from '@platform/fsdb.nedb';
import { local } from '@platform/cell.fs';

const TMP = util.resolve('tmp');

/**
 * Database.
 */
const filename = `${TMP}/sample.db`;
const db = NeDb.create({ filename });

/**
 * File system.
 */
const fs = local.init({ root: `${TMP}/fs` });

/**
 * Initialize and start the HTTP application server.
 */
const app = server.init({ title: 'sample', db, fs });
app.start({ port: 8080 });
