import { Subject } from 'rxjs';
import { filter, share, takeUntil } from 'rxjs/operators';
import { basename } from 'path';

import { exec } from '../exec';
import { chalk, delay } from '../common';
import * as t from './types';

/**
 * Represents a [NodeJS] process that can be started/stopped.
 */
export class NodeProcess {
  /**
   * [Static]
   */
  public static create(args: t.NodeProcessArgs) {
    return new NodeProcess(args);
  }

  public static cache: { [key: string]: NodeProcess } = {};
  public static singleton(args: t.NodeProcessArgs, options: { force?: boolean } = {}) {
    const { dir } = args;
    const { force } = options;
    const cache = NodeProcess.cache;
    if (force && cache[dir]) {
      cache[dir].dispose();
      delete cache[dir];
    }
    if (!cache[dir]) {
      const process = new NodeProcess(args);
      process.dispose$.subscribe(() => delete cache[dir]);
      cache[dir] = process;
    }
    return cache[dir];
  }

  public static killPort(port: number, options?: exec.IRunOptions) {
    const cmd = exec.command(`kill $(lsof -t -i:${port})`);
    return cmd.run(options);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: t.NodeProcessArgs) {
    const { dir } = args;

    this.dir = dir;

    this.dispose$.subscribe(() => {
      this.stop();
    });
  }

  public dispose() {
    this._.dispose$.next();
    this._.dispose$.complete();
  }

  /**
   * [Fields]
   */
  public readonly dir: string;
  public isSilent = false;

  private _ = {
    child: undefined as undefined | exec.ICommandPromise,
    dispose$: new Subject(),
    events$: new Subject<t.NodeProcessEvent>(),
  };
  public readonly dispose$ = this._.dispose$.pipe(share());
  public readonly events$ = this._.events$.pipe(
    takeUntil(this.dispose$),
    share(),
  );

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._.dispose$.isStopped;
  }

  public get isRunning() {
    return Boolean(this._.child);
  }

  /**
   * [Methods]
   */
  public async start(options: { force?: boolean; stopWait?: number } = {}) {
    const { dir } = this.toObject();
    let isCancelled = false;
    this.fire({
      type: 'PROCESS/starting',
      payload: {
        dir,
        get isCancelled() {
          return isCancelled;
        },
        cancel() {
          isCancelled = true;
        },
      },
    });
    if (isCancelled) {
      return;
    }

    // Stop the process if necessary.
    if (this.isRunning && options.force) {
      await this.stop({ wait: options.stopWait });
    }

    // Start the process.
    if (!this.isRunning) {
      const dir = this.dir;
      const cmd = exec.command(`yarn start`);
      const child = cmd.run({ dir, silent: true });
      const name = basename(this.dir);

      // Monitor events on the child process.
      child.complete$.subscribe(() => delete this._.child);
      child.output$.pipe(filter(e => !this.isSilent)).subscribe(e => {
        console.log(chalk.green(`${name} ›`), e.text); // tslint:disable-line
      });

      // Finish up.
      this._.child = child;
      this.fire({ type: 'PROCESS/started', payload: { dir } });
    }
  }

  public async stop(options: { wait?: number } = {}) {
    const { wait = 500 } = options;
    const { dir } = this.toObject();
    let isCancelled = false;
    this.fire({
      type: 'PROCESS/stopping',
      payload: {
        dir,
        get isCancelled() {
          return isCancelled;
        },
        cancel() {
          isCancelled = true;
        },
      },
    });
    if (isCancelled) {
      return;
    }

    // Kill the child.
    if (this._.child) {
      this._.child.kill();
      delete this._.child;
    }

    // Finish up.
    await delay(wait); // NB: Pause allows time for the process to stop gracefully and clean up.
    this.fire({ type: 'PROCESS/stopped', payload: { dir } });
  }

  public toObject() {
    return {
      dir: this.dir,
      isRunning: this.isRunning,
      isDisposed: this.isDisposed,
      isSilent: this.isSilent,
    };
  }

  /**
   * [Helpers]
   */
  private fire(e: t.NodeProcessEvent) {
    this._.events$.next(e);
  }
}
