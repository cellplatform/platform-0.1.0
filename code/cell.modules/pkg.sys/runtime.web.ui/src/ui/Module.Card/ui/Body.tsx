import React, { useEffect, useRef, useState } from 'react';
import { FC, color, COLORS, css, CssValue, t } from '../../common';

export type BodyProps = { style?: CssValue };

/**
 * Component
 */
export const View: React.FC<BodyProps> = (props) => {
  /**
   * [Render]
   */
  const styles = {
    base: css({
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
    }),
  };
  return <div {...css(styles.base, props.style)}>Body</div>;
};

type R = t.CmdCardRender<t.ModuleCardStateBody>;
const render: R = (e) => {
  //
  console.log('render - e', e);
  return <View />;
};

/**
 * Export
 */
type Fields = { render: R };
export const Body = FC.decorate<BodyProps, Fields>(
  View,
  { render },
  { displayName: 'ModuleCardBody' },
);
