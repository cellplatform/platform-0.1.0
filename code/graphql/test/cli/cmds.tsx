import { Command, t } from '../common';
import { tmp } from './FOO';

type P = t.ICommandProps;

export const root = Command.create<P>('root')
  //
  .add('tmp', async e => {
    const res = await tmp();
    e.props.next({ res });
  });
