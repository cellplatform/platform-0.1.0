import { Command, t } from '../common';

type P = t.ITestCommandProps;

const list = Command.create<P>('list', async e => true);

/**
 * The root of the CLI application.
 */
export const root = Command.create<P>('root').add(list);
