import { Subject } from 'rxjs';
import { CommandState, t, Npm } from '../components/common';
import { root } from './cmds';

export function init(args: { state$: Subject<Partial<t.ITestState>>; npm: Npm }) {
  const { state$, npm } = args;
  return CommandState.create({
    root,
    getInvokeArgs: async state => {
      const props: t.ITestCommandProps = { state$, npm };
      return { props };
    },
  });
}
