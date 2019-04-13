import { Command, t, WebAuth } from '../common';

type P = t.ITestCommandProps & { count: number };

const ns = Command.create<P>('ns')
  .add('one', async e => null)
  .add('two', async e => null)
  .add('three', async e => null);

/**
 * The root of the CLI application.
 */
export const root = Command.create<P>('root')
  .add('login', async e => {
    const { auth } = e.props;
    auth.login();
  })
  .add('logout', async e => {
    const { state$, auth } = e.props;
  });
