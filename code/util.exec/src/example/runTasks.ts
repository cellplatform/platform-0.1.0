// tslint:disable

import { exec } from '..';
import { time } from './util';

const tasks: exec.ITask[] = [
  {
    title: 'Task 1',
    task: async () => {
      await time.delay(1200);
      return exec.result.success();
    },
  },
  {
    title: 'Task 2',
    task: async () => {
      await time.delay(500);
      return exec.result.success();
    },
  },
  // {
  //   title: 'will fail',
  //   task: async () => {
  //     await time.delay(1500);
  //     throw new Error('Ouch');
  //   },
  // },
];

(async () => {
  const res = await exec.tasks.run(tasks, { silent: false, concurrent: true });
  console.log('-------------------------------------------');
  console.log('res', res);
})();
