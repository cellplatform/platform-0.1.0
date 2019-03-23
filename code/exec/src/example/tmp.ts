// tslint:disable
import { exec } from '..';

(async () => {
  const res = await exec.process.spawn('yarn test');
  console.log('-------------------------------------------');
  console.log('res', res);
})();
