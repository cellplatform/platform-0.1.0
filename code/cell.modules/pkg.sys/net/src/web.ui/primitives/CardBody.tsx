import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, Style } from '../../common';
import { Toolbar } from './Toolbar';

export type CardBodyProps = {
  children?: React.ReactNode;
  padding?: t.CssEdgesInput;
  header?: JSX.Element;
  footer?: JSX.Element;
  style?: CssValue;
};

export const CardBody: React.FC<CardBodyProps> = (props) => {
  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative', Flex: 'y-stretch-stretch' }),
    body: css({
      flex: 1,
      Scroll: true,
      ...Style.toPadding(props.padding),
    }),
  };

  const elHeader = props.header && <Toolbar edge={'N'}>{props.header}</Toolbar>;
  const elBody = <div {...styles.body}>{props.children}</div>;
  const elFooter = props.footer && <Toolbar edge={'S'}>{props.footer}</Toolbar>;

  return (
    <div {...css(styles.base, props.style)}>
      {elHeader}
      {elBody}
      {elFooter}
    </div>
  );
};
