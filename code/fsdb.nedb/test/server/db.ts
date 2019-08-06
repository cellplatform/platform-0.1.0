import { fs, NeDb } from './common';

const tmp = fs.resolve('tmp');
const filename = fs.join(tmp, 'server.doc.db');

fs.ensureDirSync(tmp);
export const db = NeDb.create({ filename });
