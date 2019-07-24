import { fs } from '@platform/fs';
import { interval } from 'rxjs';

import { NeDoc } from '../src';
import { log } from '@platform/log/lib/server';

const dir = fs.resolve('tmp');
const filename = fs.join(dir, 'script.db');
fs.ensureDirSync(dir);

const argv = process.argv.slice(2);
const by = parseInt(argv[0] || '1', 10);

log.info.gray(`Increment by ${log.white(by)}\n`);

interval(1000).subscribe(async e => {
  const key = 'foo';
  const db = NeDoc.create({ filename });
  const count = (await db.getValue<number>(key)) || 0;

  await db.put(key, count + by);

  const res = await db.getValue(key);
  log.info.gray(`count ${log.green(res)}`);
});
