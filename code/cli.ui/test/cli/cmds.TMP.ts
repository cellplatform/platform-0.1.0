import { Command, t, storage } from '../common';

export type IMyObject = {
  message: string;
  count: number;
  foo: { msg: string } | undefined;
};
const local = storage.localStorage<IMyObject>({ count: 0, message: '', foo: undefined });

type P = t.ITestCommandProps;

/**
 * The root of the CLI application.
 */
export const tmp = Command.create<P>('tmp', () => {
  console.log('local.foo', local.foo);

  local.foo = { msg: 'hello' };

  console.log('local.foo', local.foo);

  const count = local.count;
  console.log('count', count);
});
