import { prompt, log } from './common';

(async () => {
  const res = await prompt.fs.paths('scripts').checkbox();

  log.info('-------------------------------------------');
  log.info(res);
})();
