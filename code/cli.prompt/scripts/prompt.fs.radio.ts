import { prompt, log } from './common';

(async () => {
  const res = await prompt.fs.paths('scripts', { all: true }).radio();

  log.info('-------------------------------------------');
  log.info(res);
})();
