import { Subject } from 'rxjs';
import { CommandState, t } from '../common';
import { root } from './cmds';

export function init(args: {
  state$: Subject<Partial<t.ITestState>>;
  getState: () => t.ITestState;
}) {
  const { state$ } = args;
  const state = CommandState.create({
    root,
    beforeInvoke: async e => {
      const props: t.ITestCommandProps = {
        ...e.props,
        state$,
        get state() {
          return args.getState();
        },
        next(state: t.ITestState) {
          state$.next(state);
        },
      };
      return { props };
    },
  });

  return state;
}
