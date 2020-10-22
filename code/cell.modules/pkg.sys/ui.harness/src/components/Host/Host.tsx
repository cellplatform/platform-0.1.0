import * as React from 'react';

import { css, CssValue, defaultValue, formatColor, t } from '../../common';
import { Content } from './Content';

export type IHostProps = {
  layout?: t.IHostLayout;
  background?: number | string;
  style?: CssValue;
};

/**
 * A content container providing layout options for testing.
 */
export const Host: React.FC<IHostProps> = (props = {}) => {
  const { layout = {} } = props;
  const abs = layout.position?.absolute;

  const borderColor = () => {
    const border = defaultValue(layout.border, true);
    const value = border === true ? 0.3 : border === false ? 0 : border;
    return formatColor(value);
  };

  const styles = {
    base: css({
      flex: 1,
      position: 'relative',
      boxSizing: 'border-box',
      padding: 30,
      backgroundColor: formatColor(props.background),
    }),
    body: css({
      Absolute: 0,
      Flex: abs ? undefined : 'center-center',
    }),
    content: css({
      display: 'flex',
      position: abs ? 'absolute' : 'relative',
      Absolute: abs ? [abs.top, abs.right, abs.bottom, abs.left] : undefined,
      border: `solid 1px ${borderColor()}`,
      backgroundColor: formatColor(layout.background),
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>
        <div {...styles.content}>
          <Content {...layout}>{props.children}</Content>
        </div>
      </div>
    </div>
  );
};

export default Host;
