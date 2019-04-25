import { Command, t, log } from '../common';

/**
 * Login Image
 * Configured within Auth0 admin screen (Universal Login).
 * - https://user-images.githubusercontent.com/185555/56072416-b1e7ce00-5dea-11e9-946f-cdc54fadf0b3.png
 */

type P = t.ITestCommandProps;

/**
 * The root of the CLI application.
 */
export const root = Command.create<P>('root', e => {
  e.props.updateState();
})
  .add('updateState', e => e.props.updateState())
  .add('login', async e => {
    const { auth } = e.props;
    auth.login();
    e.props.updateState();
  })
  .add('logout', async e => {
    const { auth } = e.props;
    auth.logout();
    e.props.updateState();
  })
  .add('force-logout', async e => {
    const { auth } = e.props;
    auth.logout({ force: true });
    e.props.updateState();
  })
  .add('tokens', async e => {
    const { auth } = e.props;
    const write = (name: string, token: string) => log.info(`${name}: \n\n${token}\n\n`);
    const tokens = auth.tokens;
    if (tokens) {
      write('accessToken', tokens.accessToken);
      write('idToken', tokens.idToken);
    } else {
      log.info('Not logged in.');
    }
  });
