import { Subject } from 'rxjs';
import { Listr, value, time, log, t } from '../common';

type ITaskItem = { title: string; task: t.Task };

export class Tasks implements t.ITasks {
  /**
   * [Lifecycle]
   */
  public static create = () => new Tasks();
  private constructor() {} // eslint-disable-line

  /**
   * [Fields]
   */
  private list: ITaskItem[] = [];
  private errors: t.ITaskError[] = [];

  /**
   * [Properties]
   */
  public get length() {
    return this.list.length;
  }

  /**
   * [Methods]
   */

  /**
   * Add an execution task to the list.
   */
  public task(title: string, task: t.Task, options: t.IAddTaskOptions = {}) {
    const { skip } = options;
    if (!skip) {
      this.list = [...this.list, { title, task }];
    }
    return this;
  }

  /**
   * Debugging alternative that does not add the task.
   */
  public skip(title: string, task: t.Task, options: t.IAddTaskOptions = {}) {
    log.info.yellow(`SKIPPED TASK: "${title}"`);
    return this;
  }

  /**
   * Executes the list of tasks.
   */
  public async run(
    options: { concurrent?: boolean; silent?: boolean; exitOnError?: boolean } = {},
  ) {
    const renderer = options.silent ? 'silent' : 'default';
    const { concurrent, exitOnError = false } = options;
    const runner = new Listr(
      this.list.map(({ title, task }, i) => {
        return {
          title,
          task: () => this.invoke(i, title, task) as any,
        };
      }),
      { renderer, concurrent, exitOnError },
    );
    try {
      await runner.run();
    } catch (err: any) {
      // Ignore - errors are caught and returned below.
    }

    // Finish up.
    const errors = this.errors;
    const ok = errors.length === 0;
    const code = ok ? 0 : 1;
    const error = ok
      ? undefined
      : `Error while running tasks (${errors.length} of ${tasks.length} failed)`;
    return { ok, code, error, errors };
  }

  /**
   * [Helpers]
   */

  private invoke = (index: number, title: string, task: t.Task) => {
    const $ = new Subject<string>();
    const args: t.TaskArgs = {
      message: (text) => $.next(text),
      done: () => $.complete(),
      error: (err: Error | string) => {
        const error = typeof err === 'string' ? err : err.message;
        this.errors = [...this.errors, { index, title, error }];
        $.error(typeof err === 'string' ? new Error(err) : err);
      },
    };

    // Invoke the task.
    // NB:  Started after a delay so that any messages piped through the
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
}

/**
 * Initializes a list of spinner tasks.
 */
export function tasks(): t.ITasks {
  return Tasks.create();
}
