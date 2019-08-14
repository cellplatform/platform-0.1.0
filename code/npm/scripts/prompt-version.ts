import { prompt, log } from './common';

(async () => {
  const next = await prompt.incrementVersion({ save: true });

  log.info('-------------------------------------------');
  log.info(next);
})();
