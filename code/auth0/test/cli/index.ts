import { Subject } from 'rxjs';
import { CommandState, t } from '../components/common';
import { root } from './cmds';

export function init(args: { state$: Subject<Partial<t.ITestState>> }) {
  const { state$ } = args;
  return CommandState.create({
    root,
    beforeInvoke: async e => {
      const props: t.ITestCommandProps = { ...e.props, state$ };
      return { props };
    },
  });
}
