import React, { useEffect, useRef } from 'react';

import { Route } from '../Route';
import { AppRoutes } from './App.Routes';
import { css, CssValue, Doc, rx, t, slug } from './common';

export type AppProps = {
  bus: t.EventBus<any>;
  mock?: boolean;
  style?: CssValue;
  onReady?: (e: { route: t.RouteEvents }) => void;
};

export const App: React.FC<AppProps> = (props) => {
  const { bus } = props;

  const routes = useRef(AppRoutes());

  const slugRef = useRef(slug());
  const id = props.mock ? `app.mock.${slugRef.current}` : `app.${slugRef.current}`;
  const instance = { bus, id };

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const { dispose, dispose$ } = rx.disposable();

    const mock = props.mock ? Route.Bus.Dev.mock('https://mock.org/') : undefined;
    const getHref = mock?.getHref;
    const pushState = mock?.pushState;
    const route = Route.Bus.Controller({ instance, getHref, pushState, dispose$ });

    // Finish up.
    props.onReady?.({ route });
    return dispose;
  }, [props.mock]); // eslint-disable-line

  /**
   * [Render]
   */
  const styles = {
    base: css({ Absolute: 0 }),
    router: css({ flex: 1 }),
  };
  return (
    <Doc.Fonts style={css(styles.base, props.style)}>
      <Route.View instance={instance} routes={routes.current} style={styles.router} />
    </Doc.Fonts>
  );
};
