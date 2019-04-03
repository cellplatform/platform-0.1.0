import { Command, t } from '../components/common';

type P = t.ITestCommandProps;

/**
 * The root of the CLI application.
 */
export const root = Command.create<P>('root')
  //
  .add('install', async e => {
    const { npm } = e.props;
    const { params } = e.args;
    const name = (params[0] || '').toString();
    const version = (params[1] || '').toString();

    if (name) {
      await npm.install({ name, version });
    }
  });
