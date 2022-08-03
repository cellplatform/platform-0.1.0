import * as React from 'react';
import { constants, css, Color, t } from '../../common';

const KEYS: (keyof t.HostedLabel)[] = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'];

export type ILabelsProps = {
  children?: React.ReactNode;
  label?: t.HostedLayout['label'];
  color?: t.HostedLayout['labelColor'];
  fontSize?: number;
};

export const Labels: React.FC<ILabelsProps> = (props: ILabelsProps = {}) => {
  if (!props.label) {
    return null;
  }

  const { fontSize = 11, color = -0.5 } = props;
  const offset = { x: 8, y: -22 };

  const isMap = isLabelMap(props.label);
  const map = props.label as t.HostedLabel;
  const values = {
    topLeft: isMap ? map.topLeft : props.label,
    topRight: isMap ? map.topRight : undefined,
    bottomLeft: isMap ? map.bottomLeft : undefined,
    bottomRight: isMap ? map.bottomRight : undefined,
  };

  const styles = {
    text: {
      fontFamily: constants.FONT.MONO,
      fontSize,
      color: Color.format(color),
      WebkitAppRegion: 'no-drag', // NB: Window draggable within electron.
    },
    topLeft: { Absolute: [offset.y, null, null, offset.x] },
    topRight: { Absolute: [offset.y, offset.x, null, null] },
    bottomLeft: { Absolute: [null, null, offset.y, offset.x] },
    bottomRight: { Absolute: [null, offset.x, offset.y, null] },
  };

  const render = (edge: keyof t.HostedLabel) => {
    const children = values[edge];
    return children && <div {...css(styles.text, styles[edge])}>{children as any}</div>;
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

const isLabelMap = (value: t.HostedLayout['label']) => {
  if (value !== null && typeof value === 'object') {
    return Object.keys(value).some((key) => KEYS.includes(key as keyof t.HostedLabel));
  } else {
    return false;
  }
};
