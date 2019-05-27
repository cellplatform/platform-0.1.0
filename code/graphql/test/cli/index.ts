import { Subject } from 'rxjs';

import { log, CommandState, t, graphql } from '../common';
import { root } from './cmds';

export function init(args: { state$: Subject<Partial<t.ITestState>> }) {
  const { state$ } = args;

  const uri = 'http://localhost:5000/graphql';
  const client = graphql.create({ uri, name: 'MyClient', version: '1.2.3' });

  client.events$.subscribe(e => {
    log.info('🐷', e.type, e.payload);
  });

  client.headers$.subscribe(e => {
    e
      // Chain of manipulations to the headers.
      .add('FOO', 1234)
      .merge({ bar: 'hello' })
      .auth('my-token-123456');
  });

  return CommandState.create({
    root,
    beforeInvoke: async e => {
      const props: t.ICommandProps = {
        ...e.props,
        client,
        state$,
        next: (state: t.ITestState) => state$.next(state),
      };
      return { props };
    },
  });
}
