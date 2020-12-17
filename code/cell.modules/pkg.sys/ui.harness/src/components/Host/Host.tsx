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
  const abs = toAbsolute(layout.position?.absolute);

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
      overflow: 'hidden',
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
    <div {...css(styles.base, props.style)} className={'uih-Host'}>
      <div {...styles.body}>
        <div {...styles.content}>
          <Content {...layout}>{props.children}</Content>
        </div>
      </div>
    </div>
  );
};

export default Host;

/**
 * Helpers
 */

const toAbsolute = (
  input: t.IHostLayoutPosition['absolute'],
): t.IHostLayoutAbsolute | undefined => {
  if (!input) {
    return undefined;
  }

  if (Array.isArray(input)) {
    return { top: input[0], right: input[1], bottom: input[0], left: input[1] };
  }

  if (typeof input !== 'object') {
    return { top: input, right: input, bottom: input, left: input };
  }

  return input as t.IHostLayoutAbsolute;
};
