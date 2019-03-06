import { BehaviorSubject } from 'rxjs';
import { share } from 'rxjs/operators';

import { Argv } from '../Argv';
import { value, id, time } from '../common';
import * as t from './types';

/**
 * An async invoker.
 */
export function invoker<P extends object, A extends object, R>(options: {
  command: t.ICommand<P, A>;
  props: P;
  args?: string | t.ICommandArgs<A>;
}): t.ICommandInvokePromise<P, A, R> {
  const { command } = options;
  const invokeId = id.shortid();
  const args = typeof options.args === 'object' ? options.args : Argv.parse<A>(options.args || '');
  const events$ = new BehaviorSubject<t.CommandInvokeEvent>({
    type: 'COMMAND/invoke/start',
    payload: { invokeId, props: { ...options.props } },
  });

  const response = {
    events$: events$.pipe(share()),
    isComplete: false,
    props: options.props,
    args,
    result: undefined,
  };
  const sync = () => Object.keys(response).forEach(key => (promise[key] = response[key]));

  const promise = new Promise<t.ICommandInvokeResponse<P, A, R>>(async (resolve, reject) => {
    const done = () => {
      response.isComplete = true;
      sync();
      events$.next({
        type: 'COMMAND/invoke/complete',
        payload: { invokeId, props: { ...response.props } },
      });
      events$.complete();
      resolve(response);
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
        events$.next({ type: 'COMMAND/invoke/set', payload: { invokeId, key, value, props } });
        return e;
      },
    };

    // Ensure events sequence is consistently asynchronous, even if invoked synchronously.
    await time.delay(0);

    // Invoke the handler and wait for completion.
    const res = command.handler(e);
    response.result = value.isPromise(res) ? await res : res;
    done();
  });

  // Finish up.
  sync();
  return promise as t.ICommandInvokePromise<P, A, R>;
}
