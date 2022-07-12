import React from 'react';
import { Color, css, CssValue, PropList, t, COLORS } from '../common';

export type ImageInfoProps = {
  size: t.DocImageSize;
  style?: CssValue;
};

export const ImageInfo: React.FC<ImageInfoProps> = (props) => {
  const { size } = props;
  const { rendered, natural } = size;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      backgroundColor: Color.format(0.2),
      border: `solid 1px ${Color.alpha(COLORS.DARK, 0.06)}`,
      backdropFilter: `blur(6px)`,
      padding: 10,
      borderRadius: 8,
      boxSizing: 'border-box',
    }),
    inner: css({
      borderRadius: 4,
      backgroundColor: Color.format(0.9),
      border: `solid 1px ${Color.alpha(COLORS.DARK, 0.08)}`,
      Padding: [10, 15],
      boxSizing: 'border-box',
    }),
  };

  const items: t.PropListItem[] = [
    { label: 'render.size', value: `${rendered.width}px x ${rendered.height}px` },
    { label: 'render.ratio', value: `${rendered.ratio}` },
    { label: 'natural.size', value: `${natural.width}px x ${natural.height}px` },
    { label: 'natural.ratio', value: `${natural.ratio}` },
  ];

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.inner}>
        <PropList items={items} width={220} defaults={{ monospace: true }} />
      </div>
    </div>
  );
};
