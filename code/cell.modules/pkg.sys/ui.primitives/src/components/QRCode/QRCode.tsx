import ReactQRCode from 'qrcode.react';
import React from 'react';

import { color, css, CssValue } from '../../common';
import { QRCode as QRCodeType } from './types';

export type QRCodeProps = QRCodeType & { style?: CssValue };

export const QRCode: React.FC<QRCodeProps> = (props) => {
  const {
    value,
    renderAs = 'canvas',
    size = 128,
    level = 'L',
    includeMargin = false,
    imageSettings,
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
        imageSettings={imageSettings}
      />
    </div>
  );
};
