import { Command, t } from '../common';
import { threadComment } from './cmds.ThreadComment';

type P = t.ICommandProps;

/**
 * The root of the CLI application.
 */
export const root = Command.create<P>('root', e => {
  e.props.next({ el: undefined });
})
  //
  .add(threadComment);
