import { ReplaySubject, Subject, timer } from 'rxjs';
import { share, takeUntil } from 'rxjs/operators';

import { Argv } from '../Argv';
import { id, time, value } from '../common';
import * as t from './types';

/**
 * An async invoker.
 */
export function invoker<P extends object, A extends object, R>(options: {
  events$: Subject<t.CommandInvokeEvent>;
  command: t.ICommand<P, A>;
  props: P;
  args?: string | t.ICommandArgs<A>;
  timeout?: number;
}): t.ICommandInvokePromise<P, A, R> {
  const { command } = options;
  const invokeId = id.shortid();
  const args = typeof options.args === 'object' ? options.args : Argv.parse<A>(options.args || '');
  const complete$ = new Subject();

  /**
   * Ferry events to parent.
   */
  const events$ = new ReplaySubject<t.CommandInvokeEvent>();
  events$.subscribe(e => options.events$.next(e));

  /**
   * Fire initial event.
   */
  events$.next({
    type: 'COMMAND/invoke/before',
    payload: { command, invokeId, props: { ...options.props } },
  });

  /**
   * Maintain response data.
   */
  const response = {
    events$: events$.pipe(share()),
    complete$: complete$.asObservable(),
    isComplete: false,
    isTimedOut: false,
    props: options.props,
    args,
    result: undefined,
    error: undefined as any,
  };
  const sync = () => Object.keys(response).forEach(key => (promise[key] = response[key]));

  /**
   * The asynchronous promise.
   */
  const promise = new Promise<t.ICommandInvokeResponse<P, A, R>>(async (resolve, reject) => {
    const done = (error?: Error) => {
      complete$.next();
      response.isComplete = true;
      response.error = error;

      sync();
      const props = { ...response.props };

      events$.next({ type: 'COMMAND/invoke/after', payload: { command, invokeId, props, error } });
      events$.complete();
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    };

    const e: t.ICommandHandlerArgs<P, A> = {
      get args() {
        return { ...response.args };
      },
      get props() {
        return { ...response.props };
      },
      get(key) {
        return response.props[key];
      },
      set(key, value) {
        const props = { ...response.props, [key]: value };
        response.props = props;
        events$.next({
          type: 'COMMAND/invoke/set',
          payload: { command, invokeId, key, value, props },
        });
        return e;
      },
    };

    // Ensure events sequence is consistently asynchronous
    // (even if invoked synchronously).
    await time.delay(0);

    /**
     * Start timeout.
     */
    const timeout = value.defaultValue(options.timeout, 5000);
    timer(timeout)
      .pipe(takeUntil(complete$))
      .subscribe(() => {
        response.isTimedOut = true;
        const error = `The command '${command.name}' timed out.`;
        done(new Error(error));
      });

    // Invoke the handler and wait for completion.
    try {
      const res = command.handler(e);
      response.result = value.isPromise(res) ? await res : res;
      done();
    } catch (error) {
      done(error);
    }
  });

  // Finish up.
  sync();
  return promise as t.ICommandInvokePromise<P, A, R>;
}
