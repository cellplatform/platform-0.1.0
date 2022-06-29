import React, { useEffect, useState } from 'react';
import { takeUntil } from 'rxjs/operators';

import {
  Color,
  COLORS,
  css,
  CssValue,
  DEFAULT,
  FC,
  RouteTable,
  rx,
  slug,
  t,
  Value,
  LoadMask,
} from './common';
import { useRoute } from './useRoute';
import { useRouteState } from './useRouteState';
import { Dev } from './view/Dev';

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
    let current = '';

    const handleChange = async (url: t.RouteUrl) => {
      setLoading(false);

      const match = table.match(url.path);
      if (!match) return;

      current = slug();
      const id = current;
      const isCurrent = () => current === id;

      const render: t.RouteRenderHandler = (el) => {
        if (isCurrent()) {
          setLoading(false);
          setElement(el);
        }
      };

      const route = match.pattern;
      const params = match.params;
      const args: t.RouteTableHandlerArgs = { url: { ...url, route, params }, render };
      const res = match.handler(args);
      if (Value.isPromise(res)) {
        setLoading(true);
        await res;
        setLoading(false);
      }
    };

    route.url$.pipe(takeUntil(dispose$)).subscribe(handleChange);

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
        Absolute: [3, 5, null, null],
        color: Color.alpha(COLORS.MAGENTA, 0.3),
        fontSize: 10,
        pointerEvents: 'none',
      }),
    },
  };

  renderCount = debug.renderCount ? renderCount + 1 : renderCount;
  const elRenderCount = debug.renderCount && (
    <div {...styles.debug.renderCount}>{`render-${renderCount}`}</div>
  );

  const elBody = <div {...styles.body}>{element}</div>;

  const elLoading = isLoading && <LoadMask theme={theme} style={{ Absolute: 0 }} />;

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
  LoadMask: typeof LoadMask;
};
export const RouteView = FC.decorate<RouteViewProps, Fields>(
  View,
  { DEFAULT, useRoute, useRouteState, Dev, LoadMask },
  { displayName: 'Route.View' },
);
