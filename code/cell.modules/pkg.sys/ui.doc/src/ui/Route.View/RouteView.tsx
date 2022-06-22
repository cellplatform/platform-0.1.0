import React, { useEffect, useRef, useState } from 'react';
import { takeUntil } from 'rxjs/operators';

import { Color, COLORS, css, CssValue, Route, rx, t, useResizeObserver } from './common';

import { pathToRegexp } from 'path-to-regexp';

export type RouteViewProps = {
  instance: t.RouteInstance;
  routes?: t.RouteTable;
  style?: CssValue;
};

let renderCount = 0;

export const RouteView: React.FC<RouteViewProps> = (props) => {
  const { instance, routes = {} } = props;
  const route = Route.useRoute({ instance });
  const routeKeys = Object.keys(routes).join(',');

  const resize = useResizeObserver();

  const [element, setElement] = useState<JSX.Element | undefined>();

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const { dispose, dispose$ } = rx.disposable();

    /**
     * TODO 🐷
     * Move into dedicated, unit-tested [RouteTable] module.
     * - efficient (pre-compile)
     * - simple API.
     */
    const table = Object.keys(routes).map((pattern) => ({
      pattern,
      regex: pathToRegexp(pattern),
      handler: routes[pattern],
    }));

    const findMatch = (url: t.RouteUrl) => {
      return table.find((item) => item.regex.exec(url.path) !== null);
    };

    const handle = (url: t.RouteUrl) => {
      console.log('path', url.path);
      const match = findMatch(url);
      if (!match) return;

      const render: t.RouteTableRenderHandler = (callback) => {
        //
        /**
         * TODO 🐷
         * - Handle async (promise) callback (show spinner)
         */
        console.log('render ', callback);
        setElement(callback);
      };

      const { width, height } = resize.rect;
      const size = { width, height };
      const route = { pattern: match.pattern, match: url.path };
      const args: t.RouteTableHandlerArgs = { url, size, route, render };
      match.handler(args);
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
    base: css({
      position: 'relative',
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      padding: 20, // TEMP 🐷 - Dev
      color: COLORS.MAGENTA, // TEMP 🐷 - Dev
    }),
    debug: {
      renderCount: css({
        Absolute: [4, 5, null, null],
        color: Color.alpha(COLORS.MAGENTA, 0.3),
        fontSize: 10,
      }),
    },
    body: css({
      Absolute: [80, 20, 20, 20],
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      display: 'flex',
    }),
  };

  renderCount++;
  const elRenderCount = <div {...styles.debug.renderCount}>render-{renderCount}</div>;

  return (
    <div {...css(styles.base, props.style)}>
      <div>
        Router: {route.url.href} | body.size: {resize.rect.width} x {resize.rect.height}
      </div>
      {elRenderCount}
      <div ref={resize.ref} {...styles.body}>
        {element}
      </div>
    </div>
  );
};
