import { CommandState, t } from '../common';
import { root } from './cmds';

export function init(args: {}) {
  const state = CommandState.create({
    root,
    getInvokeArgs: async state => {
      return { props: { foo: 123 }, timeout: 5000 };
    },
  });

  // const invoke: t.ITestCommandLine['invoke'] = async e => {
  //   const { command } = e;
  //   const props: t.ITestCommandProps = {};

  //   // Step into namespace (if required).
  //   state.change({ text: state.text, namespace: true });

  //   // Invoke handler.
  //   // if (command.handler) {
  //   //   console.log('INVOKE', command.toString());
  //   await command.invoke({ props });
  //   // }
  // };

  return {
    state,
    // invoke,
  };
}
