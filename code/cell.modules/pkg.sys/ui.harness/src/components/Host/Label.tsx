import * as React from 'react';
import { constants, css, formatColor, t } from '../../common';

const KEYS: (keyof t.IHostLayoutLabel)[] = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'];

export type ILabelProps = {
  label?: t.IHostLayout['label'];
  fontSize?: number;
  color?: string | number;
};

export const Label: React.FC<ILabelProps> = (props: ILabelProps = {}) => {
  if (!props.label) {
    return null;
  }

  const { fontSize = 12, color = -0.5 } = props;
  const offset = { x: 5, y: -19 };

  const isMap = isLabelMap(props.label);
  const map = props.label as t.IHostLayoutLabel;
  const values = {
    topLeft: isMap ? map.topLeft : props.label,
    topRight: isMap ? map.topRight : undefined,
    bottomLeft: isMap ? map.bottomLeft : undefined,
    bottomRight: isMap ? map.bottomRight : undefined,
  };

  const styles = {
    text: {
      fontFamily: constants.MONOSPACE,
      fontSize,
      color: formatColor(color),
    },
    topLeft: { Absolute: [offset.y, null, null, offset.x] },
    topRight: { Absolute: [offset.y, offset.x, null, null] },
    bottomLeft: { Absolute: [null, null, offset.y, offset.x] },
    bottomRight: { Absolute: [null, offset.x, offset.y, null] },
  };

  const render = (edge: keyof t.IHostLayoutLabel) => {
    const children = values[edge];
    return children && <div {...css(styles.text, styles[edge])}>{children}</div>;
  };

  return (
    <>
      {render('topLeft')}
      {render('topRight')}
      {render('bottomLeft')}
      {render('bottomRight')}
    </>
  );
};

/**
 * Helpers
 */

const isLabelMap = (value: t.IHostLayout['label']) => {
  if (value !== null && typeof value === 'object') {
    return Object.keys(value).some((key) => KEYS.includes(key as keyof t.IHostLayoutLabel));
  } else {
    return false;
  }
};
