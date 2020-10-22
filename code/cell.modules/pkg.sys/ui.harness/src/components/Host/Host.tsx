import * as React from 'react';
import { color, t, css, CssValue, defaultValue } from '../../common';
import { Cropmarks } from './Host.Cropmarks';

export type IHostProps = {
  layout?: t.IHostLayout;
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
    return color.format(value);
  };

  const cropmarks = {
    get value() {
      return defaultValue(layout.cropmarks, true);
    },

    get color() {
      const value = cropmarks.value;
      const res = value === true ? 1 : value === false ? 0 : value;
      return color.format(res);
    },

    render() {
      if (!defaultValue(layout.cropmarks, true)) {
        return null;
      }

      const size = 20;
      const margin = 6;
      const offset = size + margin;

      // Ensure the space surrounding an "absolute positioning" is
      // not less than offset space of the cropmarks.
      if (abs && Object.keys(abs).some((key) => abs[key] < offset)) {
        return null;
      }

      return <Cropmarks color={cropmarks.color} margin={margin} size={size} />;
    },
  };

  const renderContent = () => {
    if (!props.children) {
      return null;
    }
    const styles = {
      outer: css({
        width: layout.width,
        height: layout.height,
        WebkitAppRegion: 'none',
        flex: 1,
      }),
    };
    return (
      <>
        {cropmarks.render()}
        <div {...styles.outer}>{props.children}</div>
      </>
    );
  };

  const styles = {
    base: css({
      flex: 1,
      position: 'relative',
      padding: 30,
      boxSizing: 'border-box',
    }),
    body: css({
      Absolute: 0,
      Flex: abs ? undefined : 'center-center',
    }),
    outer: css({
      position: abs ? 'absolute' : 'relative',
      Absolute: abs ? [abs.top, abs.right, abs.bottom, abs.left] : undefined,
      border: `solid 1px ${borderColor()}`,
      backgroundColor: color.format(layout.background),
      display: 'flex',
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>
        <div {...styles.outer}>{renderContent()}</div>
      </div>
    </div>
  );
};

export default Host;
