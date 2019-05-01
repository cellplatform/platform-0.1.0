import { Command, t } from '../common';

type P = t.ICommandProps & { count: number };

/**
 * The root of the CLI application.
 */
export const root = Command.create<P>('root')
  //
  .add('title', e => {});
