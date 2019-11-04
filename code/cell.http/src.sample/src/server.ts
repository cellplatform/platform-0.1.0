import { server, fs } from './common';
import { NeDb } from '@platform/fsdb.nedb';

const dir = fs.resolve('tmp');
const filename = fs.join(dir, 'sample.db');
const db = NeDb.create({ filename });

const app = server.init({
  title: 'Sample',
  db,
});

app.listen({ port: 8080 });
