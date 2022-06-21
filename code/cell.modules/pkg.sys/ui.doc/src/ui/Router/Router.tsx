import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t, rx, Route } from './common';

export type RouterProps = {
  instance: t.RouteInstance;
  style?: CssValue;
};

export const Router: React.FC<RouterProps> = (props) => {
  const route = Route.useRoute(props.instance);

  /**
   * [Render]
   */
  const styles = {
    base: css({
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      padding: 20,
    }),
  };

  const url = route.href;

  return <div {...css(styles.base, props.style)}>Router: {route.href}</div>;
};
