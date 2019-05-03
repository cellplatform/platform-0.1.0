import { Command, t, localStorage } from '../common';

export type IMyObject = {
  message: string;
  count: number;
  foo: { msg: string } | undefined;
};
const local = localStorage<IMyObject>({
  count: { default: 0, key: 'FOO/count' },
  message: 'KEY/message',
  foo: 'KEY/foo',
});

type P = t.ITestCommandProps;

/**
 * The root of the CLI application.
 */
export const tmp = Command.create<P>('tmp', e => {
  // console.log('local.foo', local.foo);
  // local.foo = { msg: 'hello' };

  // console.log('local.foo', local.foo);
  local.count = e.param<number>(0, 0);

  const count = local.count;
  console.log('count', count);
});
