import ReactQRCode from 'qrcode.react';
import React from 'react';

import { color, css, CssValue, FC, DEFAULT } from './common';
import { QRCode as QRCodePropTypes } from './types';

export type QRCodeProps = QRCodePropTypes & { style?: CssValue };

const View: React.FC<QRCodeProps> = (props) => {
  const {
    value,
    renderAs = DEFAULT.renderAs,
    size = DEFAULT.size,
    level = DEFAULT.level,
    includeMargin = DEFAULT.includeMargin,
  } = props;
  const bgColor = color.format(props.bgColor);
  const fgColor = color.format(props.fgColor);

  const styles = {
    base: css({
      width: size,
      height: size,
    }),
  };

  const childProps = { ...props };
  delete childProps['style'];

  return (
    <div {...css(styles.base, props.style)}>
      <ReactQRCode
        value={value}
        renderAs={renderAs}
        size={size}
        bgColor={bgColor}
        fgColor={fgColor}
        level={level}
        includeMargin={includeMargin}
        imageSettings={image(props)}
      />
    </div>
  );
};

/**
 * Helpers
 */
function image(props: QRCodeProps) {
  const {
    src = '',
    x,
    y,
    width = DEFAULT.size,
    height = DEFAULT.size,
    excavate = false,
  } = props.imageSettings ?? {};
  return { src, x, y, width, height, excavate };
}

/**
 * Export
 */

type Fields = {
  DEFAULT: typeof DEFAULT;
};
export const QRCode = FC.decorate<QRCodeProps, Fields>(
  View,
  { DEFAULT },
  { displayName: 'QRCode' },
);
