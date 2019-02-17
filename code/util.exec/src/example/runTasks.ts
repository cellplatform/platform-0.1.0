// tslint:disable

import { exec } from '..';
import { time } from './util';

export { time, exec };
export const tasks: exec.ITask[] = [
  {
    title: 'Task 1',
    task: async () => {
      // Async
      await time.delay(1200);
    },
  },
  {
    title: 'Task 2',
    task: () => {
      // Sync - no return value.
      return;
    },
  },
  {
    title: 'Task will fail',
    task: async () => {
      await time.delay(800);
      throw new Error('Ouch...did fail!');
    },
  },
];

export async function run() {
  const res = await exec.tasks.run(tasks, { silent: false, concurrent: true });
  console.log('-------------------------------------------');
  console.log('res', res);
}
