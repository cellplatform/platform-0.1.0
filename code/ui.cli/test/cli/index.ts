import { CommandState, t } from '../common';
import { root } from './cmds';

export function init(args: {}) {
  const state = CommandState.create({ root });

  const invoke: t.ITestCommandLine['invoke'] = async e => {
    const { command, args } = e;
    const props: t.ITestCommandProps = {};

    // Step into namespace (if required).
    state.change({ text: state.text, namespace: true });

    // Invoke handler.
    if (command.handler) {
      console.log('INVOKE', command.toString());
      await command.invoke({ props, args });
    }
  };

  return {
    state,
    invoke,
  };
}
