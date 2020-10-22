import * as React from 'react';

import { css, CssValue, defaultValue, formatColor, t } from '../../common';
import { Cropmarks } from './Host.Cropmarks';

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
      position: abs ? 'absolute' : 'relative',
      Absolute: abs ? [abs.top, abs.right, abs.bottom, abs.left] : undefined,
      border: `solid 1px ${borderColor()}`,
      backgroundColor: formatColor(layout.background),
      display: 'flex',
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>
        <div {...styles.content}>
          <HostContent {...layout}>{props.children}</HostContent>
        </div>
      </div>
    </div>
  );
};

/**
 * The Host content.
 */
export const HostContent: React.FC<t.IHostLayout> = (props = {}) => {
  if (!props.children) {
    return null;
  }

  const styles = {
    children: css({
      position: 'relative',
      width: props.width,
      height: props.height,
      WebkitAppRegion: 'none',
      boxSizing: 'border-box',
      flex: 1,
    }),
  };
  return (
    <>
      <HostCropmarks {...props} />
      <div {...styles.children}>{props.children}</div>
    </>
  );
};

const HostCropmarks: React.FC<t.IHostLayout> = (props = {}) => {
  const cropmarks = defaultValue(props.cropmarks, true);
  if (!cropmarks) {
    return null;
  }

  const abs = props.position?.absolute;
  const color = formatColor(cropmarks === true ? 1 : cropmarks);

  const size = 20;
  const margin = 6;
  const offset = size + margin;

  // Ensure the space surrounding an "absolute positioning" is
  // not less than offset space of the cropmarks.
  if (abs && Object.keys(abs).some((key) => abs[key] < offset)) {
    return null;
  }

  return <Cropmarks color={color} margin={margin} size={size} />;
};

export default Host;
