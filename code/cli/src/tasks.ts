import { Subject } from 'rxjs';
import { Listr, value, time } from './common';

export type Task = (args: TaskArgs) => Promise<any> | any;
export type TaskArgs = {
  message: (text: string) => void;
  done: () => void;
  error: (err: Error | string) => void;
};

export type ITaskError = {
  index: number;
  title: string;
  error: string;
};

type ITaskItem = { title: string; task: Task };

/**
 * Initializes a list of spinner tasks.
 */
export function tasks() {
  let list: ITaskItem[] = [];
  let errors: ITaskError[] = [];

  const run = (index: number, title: string, task: Task) => {
    const $ = new Subject<string>();
    const args: TaskArgs = {
      message: text => $.next(text),
      done: () => $.complete(),
      error: (err: Error | string) => {
        const error = typeof err === 'string' ? err : err.message;
        errors = [...errors, { index, title, error }];
        $.error(typeof err === 'string' ? new Error(err) : err);
      },
    };

    // Invoke the task.
    // NB:  Started after a delay so that any message piped through the
    //      observable are displayed in the UI immediately.
    time.delay(0, () => {
      const res = task(args);
      if (value.isPromise(res)) {
        (res as any).then(args.done).catch((err: Error) => {
          args.error(err);
        });
      } else {
        args.done();
      }
    });

    // Finish up.
    return $;
  };

  const api = {
    get length() {
      return list.length;
    },

    /**
     * Add an execution task to the list.
     */
    task(title: string, task: Task) {
      list = [...list, { title, task }];
      return api;
    },

    /**
     * Executes the list of tasks.
     */
    async run(args: { concurrent?: boolean; silent?: boolean; exitOnError?: boolean } = {}) {
      const renderer = args.silent ? 'silent' : 'default';
      const { concurrent, exitOnError = false } = args;
      const runner = new Listr(
        list.map(({ title, task }, i) => {
          return {
            title,
            task: () => run(i, title, task) as any,
          };
        }),
        { renderer, concurrent, exitOnError },
      );
      try {
        await runner.run();
      } catch (err) {
        // Ignore - errors are caught and returned below.
      }

      // Finish up.
      const ok = errors.length === 0;
      const code = ok ? 0 : 1;
      const error = ok
        ? undefined
        : `Error while running tasks (${errors.length} of ${tasks.length} failed)`;
      return { ok, code, error, errors };
    },
  };

  return api;
}
