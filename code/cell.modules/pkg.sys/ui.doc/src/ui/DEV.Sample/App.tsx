import React, { useRef } from 'react';

import { Route } from '../Route';
import { AppRoutes } from './App.Routes';
import { css, CssValue, Doc, t } from './common';

export type AppProps = {
  bus: t.EventBus<any>;
  mock?: boolean;
  style?: CssValue;
  onReady?: t.RoutReadyHandler;
};

export const App: React.FC<AppProps> = (props) => {
  const { bus, mock, onReady } = props;

  const { instance } = Route.View.useRouteController({ bus, mock, onReady });
  const routes = useRef(AppRoutes());

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
