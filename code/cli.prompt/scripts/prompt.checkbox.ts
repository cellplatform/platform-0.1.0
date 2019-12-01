import { prompt } from './common';

(async () => {
  const res = await prompt.checkbox({
    message: 'My message',
    items: ['one', { name: 'two' }, '----', { name: 'three', value: 3 }],
  });

  console.log('-------------------------------------------');
  console.log(res);
})();
