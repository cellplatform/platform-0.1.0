import { Subject } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';

import { CommandState, log, t, WebAuth } from '../common';
import { root } from './cmds';

export function init(args: { state$: Subject<Partial<t.ITestState>> }) {
  const { state$ } = args;

  const auth = WebAuth.create({
    domain: 'test-platform.auth0.com',
    clientId: 'oPjzxrhihhlEtZ2dRz5KnCRUfBzHgsRh',
    // responseType: 'token id_token',
    // scope: 'openid',
  });

  const updateState = () => {
    const data = auth.toObject();
    const tokens = data.tokens;
    if (tokens) {
      tokens.accessToken = tokens.accessToken.substring(0, 15) + '...';
      tokens.idToken = tokens.idToken.substring(0, 15) + '...';
    }
    state$.next({ data });
  };

  auth.events$.subscribe(e => {
    log.info('🐷', e.type, e.payload);
    updateState();
  });

  auth.changed$
    .pipe(
      filter(e => e.isLoggedIn),
      distinctUntilChanged((prev, next) => prev.isLoggedIn === next.isLoggedIn),
    )
    .subscribe(() => {
      const { accessToken, idToken } = auth.tokens;
      log.group('🌳 Tokens');
      log.info(`accessToken: \n${accessToken}`);
      log.info(`idToken: \n${idToken}`);
      log.groupEnd();
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
