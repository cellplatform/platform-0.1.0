import { Command, t } from '../components/common';

type P = t.ITestCommandProps & { count: number };

export const root = Command.create<P>('root')
  //
  .add('foo', async e => {
    //
  })
  .add('bar');
