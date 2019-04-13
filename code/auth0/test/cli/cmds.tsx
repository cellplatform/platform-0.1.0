import { Command, t, WebAuth } from '../common';

/**
 * Login Image
 *   - https://user-images.githubusercontent.com/185555/56072416-b1e7ce00-5dea-11e9-946f-cdc54fadf0b3.png
 */

type P = t.ITestCommandProps;

/**
 * The root of the CLI application.
 */
export const root = Command.create<P>('root', e => {
  e.props.updateState();
})
  .add('update', e => e.props.updateState())
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
  .add('logout-force', async e => {
    const { auth } = e.props;
    auth.logout({ force: true });
    e.props.updateState();
  });
