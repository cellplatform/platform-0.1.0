import { prompt, log } from './common';

(async () => {
  const res = await prompt.radio({
    message: 'My message',
    items: ['one', { name: 'two' }, '----', { name: 'three', value: 3 }],
  });

  log.info('-------------------------------------------');
  log.info(res);
})();
