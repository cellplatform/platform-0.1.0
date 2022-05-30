import React from 'react';
import { css, CssValue, t, Style } from '../../common';
import { Toolbar } from './Toolbar';

export type CardBodyProps = {
  children?: React.ReactNode;
  padding?: t.CssEdgesInput;
  header?: { el: JSX.Element; height?: number; padding?: t.CssEdgesInput };
  footer?: { el: JSX.Element; height?: number; padding?: t.CssEdgesInput };
  style?: CssValue;
};

export const CardBody: React.FC<CardBodyProps> = (props) => {
  const { header, footer } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      Flex: 'y-stretch-stretch',
      boxSizing: 'border-box',
      flex: 1,
    }),
    body: css({
      flex: 1,
      Scroll: true,
      Flex: 'y-stretch-stretch',
      ...Style.toPadding(props.padding),
    }),
    header: css({ height: header?.height }),
    footer: css({ fontSize: 12, height: footer?.height }),
  };

  const elHeader = header && (
    <Toolbar edge={'N'} style={styles.header} padding={header.padding}>
      {header.el}
    </Toolbar>
  );

  const elBody = <div {...styles.body}>{props.children}</div>;

  const elFooter = footer && (
    <Toolbar edge={'S'} style={styles.footer} padding={footer.padding}>
      {footer.el}
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
