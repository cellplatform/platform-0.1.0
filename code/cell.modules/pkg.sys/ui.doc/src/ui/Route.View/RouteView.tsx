import React, { useEffect, useState } from 'react';
import { takeUntil } from 'rxjs/operators';

import { useRoute } from './useRoute';
import { useRouteState } from './useRouteState';
import { Dev } from './view/Dev';

import { FC, Color, COLORS, css, CssValue, RouteTable, rx, t, DEFAULT, Value } from './common';
import { Loading } from './view/Loading';

let renderCount = 0;

/**
 * Types
 */
export type RouteViewProps = {
  instance: t.RouteInstance;
  routes?: t.RouteTableDefs;
  theme?: t.RouteViewTheme;
  debug?: { renderCount?: boolean };
  style?: CssValue;
};

/**
 * Component
 */
const View: React.FC<RouteViewProps> = (props) => {
  const { instance, routes = {}, theme = DEFAULT.THEME, debug = {} } = props;
  const route = useRoute({ instance });
  const routeKeys = Object.keys(routes).join(',');

  const [element, setElement] = useState<JSX.Element | undefined>();
  const [isLoading, setLoading] = useState(false);

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const { dispose, dispose$ } = rx.disposable();
    const table = RouteTable(routes);
    let executionId = 0;

    const handle = async (url: t.RouteUrl) => {
      setLoading(false);

      const match = table.match(url.path);
      if (!match) return;

      executionId++;
      const id = executionId;
      const isStale = () => executionId !== id;

      const render: t.RouteRenderHandler = (el) => {
        if (!isStale()) setElement(el);
      };

      const route = match.pattern;
      const args: t.RouteTableHandlerArgs = { url, route, render };
      const res = match.handler(args);
      if (Value.isPromise(res)) {
        setLoading(true);
        await res;
        setLoading(false);
      }
    };

    route.url$.pipe(takeUntil(dispose$)).subscribe((e) => {
      console.group('🌳 ');
      handle(e);
      console.groupEnd();
    });

    return dispose;
  }, [routeKeys, route.instance.id, route.instance.bus]); // eslint-disable-line

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative', overflow: 'hidden' }),
    body: css({
      Absolute: 0,
      display: 'flex',
      opacity: isLoading ? 0.2 : 1,
    }),
    debug: {
      renderCount: css({
        Absolute: [4, 5, null, null],
        color: Color.alpha(COLORS.MAGENTA, 0.3),
        fontSize: 10,
      }),
    },
  };

  renderCount = debug.renderCount ? renderCount + 1 : renderCount;
  const elRenderCount = debug.renderCount && (
    <div {...styles.debug.renderCount}>render-{renderCount}</div>
  );

  const elBody = <div {...styles.body}>{element}</div>;

  const elLoading = isLoading && <Loading theme={theme} style={{ Absolute: 0 }} />;

  return (
    <div {...css(styles.base, props.style)}>
      {elBody}
      {elRenderCount}
      {elLoading}
    </div>
  );
};

/**
 * Export
 */
type Fields = {
  DEFAULT: typeof DEFAULT;
  useRoute: typeof useRoute;
  useRouteState: typeof useRouteState;
  Dev: typeof Dev;
};
export const RouteView = FC.decorate<RouteViewProps, Fields>(
  View,
  { DEFAULT, useRoute, useRouteState, Dev },
  { displayName: 'Route.View' },
);
