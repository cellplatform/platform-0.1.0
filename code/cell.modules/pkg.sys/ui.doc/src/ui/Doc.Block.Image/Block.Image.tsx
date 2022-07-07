import React, { useRef, useState } from 'react';

import { COLORS, css, CssValue, DEFAULT, FC, t } from './common';
import { LoadFail } from './ui/LoadFail';
import { Util } from './Util';

/**
 * Type
 */
export type DocImageBlockProps = {
  url?: string;
  width?: number;
  borderRadius?: number;
  credit?: React.ReactNode;
  margin?: t.DocBlockMargin;
  style?: CssValue;
  onReady?: t.DocImageBlockReadyHandler;
};

/**
 * Component
 */
const View: React.FC<DocImageBlockProps> = (props) => {
  const { url, width, borderRadius = DEFAULT.borderRadius, credit, margin = {} } = props;

  const imgRef = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState<t.DocImageBlockReadyHandlerArgs | undefined>();

  /**
   * [Handlers]
   */
  const fireReady = (args: { error?: string } = {}) => {
    const { error } = args;
    const url = props.url ?? '';
    const size = Util.toSize(imgRef.current);
    const ready: t.DocImageBlockReadyHandlerArgs = { url, size, error };
    setReady(ready);
    props.onReady?.(ready);
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      color: COLORS.DARK,
      marginTop: margin.top,
      marginBottom: margin.bottom,
    }),
    body: css({
      overflow: 'hidden',
      borderRadius,
      width,
    }),
    image: css({
      width,
      display: ready && !ready.error ? 'block' : 'none',
    }),
    credit: css({
      marginTop: 3,
      fontSize: 11,
      textAlign: 'right',
      opacity: 0.3,
    }),
  };

  const elImg = url && (
    <img
      {...styles.image}
      ref={imgRef}
      src={url}
      onLoad={(e) => fireReady()}
      onError={(e) => fireReady({ error: `Failed to load image.` })}
    />
  );

  const elLoadFail = Boolean(ready?.error) && <LoadFail url={url} borderRadius={borderRadius} />;

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>
        {elImg}
        {elLoadFail}
      </div>
      {credit && <div {...styles.credit}>{credit}</div>}
    </div>
  );
};

/**
 * Export
 */
type Fields = {
  DEFAULT: typeof DEFAULT;
  Util: typeof Util;
};
export const DocImageBlock = FC.decorate<DocImageBlockProps, Fields>(
  View,
  { DEFAULT, Util },
  { displayName: 'Doc.ImageBlock' },
);
