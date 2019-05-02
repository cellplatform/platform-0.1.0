import { Command, t } from '../common';

type P = t.ITestCommandProps;

/**
 * The root of the CLI application.
 */
export const shell = Command.create<P>('shell', e => {
  console.group('🌼 invoked:shell');
  console.groupEnd();
}).add('tree', e => {
  const state: any = {
    ...e.props.state,
    tree: {
      ...(e.props.state.tree || {}),
      width: e.option(['width', 'w']),
      background: e.option(['background', 'bg']),
    },
  };
  e.props.next(state);
});
