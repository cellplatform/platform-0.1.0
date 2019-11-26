import { prompt } from './common';

(async () => {
  const res = await prompt.text({ message: 'Please enter your name.', default: 'Mary' });

  console.log('-------------------------------------------');
  console.log(res);
})();
