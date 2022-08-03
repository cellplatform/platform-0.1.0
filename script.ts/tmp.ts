import { fs } from '../code/fs';

type T = { name: string; version: string; dir: string; npm?: { version: string } };
type M = { modules: T[] };

(async () => {
  //
  const publish = (await fs.readJson('./msync.publish.json')) as M;

  publish.modules.forEach((m) => {
    console.log(`${m.dir}`);
  });
})();
