import { prompt } from './common';

(async () => {
  const next = await prompt.list({
    message: 'My message',
    items: ['one', { name: 'two' }, '----', { name: 'three', value: 3 }],
  });

  console.log('-------------------------------------------');
  console.log(next);
})();
