import { Subject } from 'rxjs';

import { CommandState, t } from '../common';
import { root } from './cmds';

export function init(args: { state$: Subject<Partial<t.ITestState>> }) {
  const { state$ } = args;
  return CommandState.create({
    root,
    beforeInvoke: async e => {
      console.log('e.props', e.props);
      const props: t.ITestCommandProps = { ...e.props, state$ };
      return { props };
    },
  });
}
