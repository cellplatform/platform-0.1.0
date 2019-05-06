import { Subject } from 'rxjs';

import { log, CommandState, t, graphql } from '../common';
import { root } from './cmds';

export function init(args: { state$: Subject<Partial<t.ITestState>> }) {
  const { state$ } = args;

  const uri = 'http://localhost:5000/graphql';
  const client = graphql.create({ uri });

  client.events$.subscribe(e => {
    log.info('🐷', e.type, e.payload);
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
