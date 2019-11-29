import { server, util } from './common';
import { NeDb } from '@platform/fsdb.nedb';
import { local } from '@platform/cell.fs';

const tmp = util.resolve('tmp');

/**
 * Database
 */
const filename = `${tmp}/sample.db`;
const db = NeDb.create({ filename });

/**
 * File system.
 */
const fs = local.init({ root: `${tmp}/fs` });

/**
 * Initialize and start the HTTP application server.
 */
const app = server.init({ title: 'sample (local)', db, fs });
app.listen({ port: 8080 });
