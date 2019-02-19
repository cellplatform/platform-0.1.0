// tslint:disable
import { interval, Observable } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

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
    title: 'Observable',
    task: () => {
      // Example returning an observable that updates a
      // status message under the task as it progresses.
      return new Observable(observer => {
        let count = 0;
        interval(200)
          .pipe(takeWhile(() => count < 10))
          .subscribe({
            complete: () => observer.complete(),
            next() {
              count++;
              observer.next(`count-${count}`);
            },
          });
      });
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

  const toMessage = (error?: Error) => (error ? error.message : undefined);
  console.log({ ...res, error: toMessage(res.error) });
}
