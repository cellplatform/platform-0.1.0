import { Subject } from 'rxjs';
import { CommandState, log, t, WebAuth } from '../common';
import { root } from './cmds';

export function init(args: { state$: Subject<Partial<t.ITestState>> }) {
  const { state$ } = args;

  const auth = WebAuth.create({
    domain: 'test-platform.auth0.com',
    clientId: 'oPjzxrhihhlEtZ2dRz5KnCRUfBzHgsRh',

    /**
     * See:
     * - https://manage.auth0.com/dashboard/us/test-platform/apis/5cc17072967c0308e756065f/settings
     */
    audience: 'https://uiharness.com/api/sample',
    // audience: 'https://test-platform.auth0.com/userinfo',
    scope: 'openid profile db:read',
    responseType: 'token id_token', // (default)
  });

  const updateState = () => {
    const data = auth.toObject();
    const tokens = data.tokens;
    const shorten = (token: string) => token.substring(0, 15) + '...';
    if (tokens) {
      tokens.accessToken = shorten(tokens.accessToken);
      tokens.idToken = shorten(tokens.idToken);
    }
    state$.next({ data });
  };

  auth.events$.subscribe(e => {
    log.info('🐷', e.type, e.payload);
    updateState();
  });

  return CommandState.create({
    root,
    beforeInvoke: async e => {
      const props: t.ITestCommandProps = {
        ...e.props,
        auth,
        state$,
        updateState,
      };
      return { props };
    },
  });
}
