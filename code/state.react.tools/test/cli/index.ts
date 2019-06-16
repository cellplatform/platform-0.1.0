import { CommandState, t } from '../common';
import { root } from './cmds';
import { store } from '../store';

export function init(args: {}) {
  const {} = args;
  return CommandState.create({
    root,
    beforeInvoke: async e => {
      const props: t.ITestCommandProps = { ...e.props, store };
      return { props };
    },
  });
}
