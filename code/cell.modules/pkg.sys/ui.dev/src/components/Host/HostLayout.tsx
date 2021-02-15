import * as React from 'react';

import { css, CssValue, defaultValue, formatColor, t, constants } from '../../common';
import { Subject, SubjectCropmark } from './Subject';

export type HostLayoutProps = {
  host?: t.Host;
  subject?: t.ActionSubject<any>;
  style?: CssValue;
};

/**
 * A content container providing layout options for testing.
 */
export const HostLayout: React.FC<HostLayoutProps> = (props = {}) => {
  const { subject, host } = props;
  const items = subject?.items || [];
  const orientation = defaultValue(host?.orientation, 'y');
  const spacing = Math.max(0, defaultValue(host?.spacing, 60));

  const styles = {
    base: css({
      flex: 1,
      position: 'relative',
      color: formatColor(host?.color),
      backgroundColor: formatColor(host?.background),
    }),
    body: css({
      Absolute: 0,
      boxSizing: 'border-box',
      Flex: `${orientation === 'y' ? 'vertical' : 'horizontal'}-center-center`,
    }),
  };

  const elContent = items.map((item, i) => {
    const isLast = i === items.length - 1;
    const layout = { ...subject?.layout, ...item.layout };

    const abs = toAbsolute(layout.position);
    const margin = !isLast ? spacing : undefined;
    const cropmark: SubjectCropmark = { size: 15, margin: 6 };

    const style = css({
      display: 'flex',
      position: abs ? 'absolute' : 'relative',
      Absolute: abs ? [abs.top, abs.right, abs.bottom, abs.left] : undefined,
      border: layout.border ? `solid 1px ${toBorderColor(layout.border)}` : undefined,
      backgroundColor: formatColor(layout.background),
      marginBottom: orientation === 'y' && margin ? margin : undefined,
      marginRight: orientation === 'x' && margin ? margin : undefined,
    });

    return (
      <div key={i} {...style}>
        <Subject cropmark={cropmark} layout={layout}>
          {item.el}
        </Subject>
      </div>
    );
  });

  return (
    <div {...css(styles.base, props.style)} className={constants.CSS.HOST}>
      <div {...styles.body}>{elContent}</div>
    </div>
  );
};

/**
 * Helpers
 */
const toAbsolute = (input: t.HostedLayout['position']): t.AbsolutePosition | undefined => {
  if (input === undefined) return undefined;

  if (Array.isArray(input)) {
    type Input = string | number | null | undefined;
    const toValue = (value: Input) => (value === null ? undefined : value);
    const index = (index: number) => toValue(input[index]);

    if (input.length > 2) {
      return { top: index(0), right: index(1), bottom: index(2), left: index(3) };
    } else {
      const y = index(0);
      const x = index(1);
      return { top: y, right: x, bottom: y, left: x };
    }
  }

  if (typeof input !== 'object') {
    return { top: input, right: input, bottom: input, left: input };
  }

  return input as t.AbsolutePosition;
};

const toBorderColor = (input: t.HostedLayout['border']) => {
  const border = defaultValue(input, true);
  const value = border === true ? 0.3 : border === false ? 0 : border;
  return formatColor(value);
};
