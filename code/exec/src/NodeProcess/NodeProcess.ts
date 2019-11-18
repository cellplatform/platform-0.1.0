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
    const { cwd } = args;
    const { force } = options;
    const cache = NodeProcess.cache;
    if (force && cache[cwd]) {
      cache[cwd].dispose();
      delete cache[cwd];
    }
    if (!cache[cwd]) {
      const process = new NodeProcess(args);
      process.dispose$.subscribe(() => delete cache[cwd]);
      cache[cwd] = process;
    }
    return cache[cwd];
  }

  public static killPort(port: number, options?: exec.IRunOptions) {
    const cmd = exec.command(`kill $(lsof -t -i:${port})`);
    return cmd.run(options);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: t.NodeProcessArgs) {
    const { cwd, NPM_TOKEN } = args;
    this.cwd = cwd;
    this._.NPM_TOKEN = NPM_TOKEN;
    this.dispose$.subscribe(() => this.stop());
  }

  public dispose() {
    this._.dispose$.next();
    this._.dispose$.complete();
  }

  /**
   * [Fields]
   */
  public readonly cwd: string;
  public isSilent = false;

  private _ = {
    NPM_TOKEN: undefined as undefined | string,
    child: undefined as undefined | exec.ICommandPromise,
    dispose$: new Subject(),
    events$: new Subject<t.NodeProcessEvent>(),
  };
  public readonly dispose$ = this._.dispose$.pipe(share());
  public readonly events$ = this._.events$.pipe(takeUntil(this.dispose$), share());

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._.dispose$.isStopped;
  }

  public get isRunning() {
    return Boolean(this._.child);
  }

  private get env() {
    const { NPM_TOKEN } = this._;
    return NPM_TOKEN ? { NPM_TOKEN } : undefined;
  }

  /**
   * [Methods]
   */
  public async start(options: { force?: boolean; stopWait?: number } = {}) {
    const { cwd: dir } = this.toObject();
    let isCancelled = false;
    this.fire({
      type: 'PROCESS/starting',
      payload: {
        cwd: dir,
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
      const dir = this.cwd;
      const env = this.env;
      const cmd = exec.command(`yarn start`);
      const child = cmd.run({ cwd: dir, env, silent: true });
      const name = basename(this.cwd);

      // Monitor events on the child process.
      child.complete$.subscribe(() => delete this._.child);
      child.output$.pipe(filter(e => !this.isSilent)).subscribe(e => {
        console.log(chalk.green(`${name} ›`), e.text); // tslint:disable-line
      });

      // Finish up.
      this._.child = child;
      this.fire({ type: 'PROCESS/started', payload: { cwd: dir } });
    }
  }

  public async stop(options: { wait?: number } = {}) {
    const { wait = 500 } = options;
    const { cwd } = this.toObject();
    let isCancelled = false;
    this.fire({
      type: 'PROCESS/stopping',
      payload: {
        cwd,
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
    this.fire({ type: 'PROCESS/stopped', payload: { cwd } });
  }

  public toObject() {
    return {
      cwd: this.cwd,
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
