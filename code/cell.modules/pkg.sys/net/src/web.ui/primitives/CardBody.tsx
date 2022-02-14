import React from 'react';
import { css, CssValue, t, Style } from '../../common';
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
    base: css({ position: 'relative', Flex: 'y-stretch-stretch', flex: 1 }),
    body: css({
      flex: 1,
      Scroll: true,
      Flex: 'y-stretch-stretch',
      ...Style.toPadding(props.padding),
    }),
    header: css({}),
    footer: css({ fontSize: 12 }),
  };

  const elHeader = props.header && (
    <Toolbar edge={'N'} style={styles.header}>
      {props.header}
    </Toolbar>
  );

  const elBody = <div {...styles.body}>{props.children}</div>;

  const elFooter = props.footer && (
    <Toolbar edge={'S'} style={styles.footer}>
      {props.footer}
    </Toolbar>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elHeader}
      {elBody}
      {elFooter}
    </div>
  );
};
