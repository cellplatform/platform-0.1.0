import { Command, t } from '../common';

type P = t.ICommandProps;

export const root = Command.create<P>('root')
  //
  .add('query', e => {
    e.props.next({ res: 123 });
  });
