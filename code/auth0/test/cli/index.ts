import { Subject } from 'rxjs';
import { CommandState, t, WebAuth } from '../common';
import { root } from './cmds';

export function init(args: { state$: Subject<Partial<t.ITestState>> }) {
  const { state$ } = args;

  const auth = WebAuth.create({
    domain: 'test-platform.auth0.com',
    clientId: 'oPjzxrhihhlEtZ2dRz5KnCRUfBzHgsRh',
    // responseType: 'token id_token',
    // scope: 'openid',
  });

  return CommandState.create({
    root,
    beforeInvoke: async e => {
      const props: t.ITestCommandProps = { ...e.props, auth, state$ };
      return { props };
    },
  });
}
