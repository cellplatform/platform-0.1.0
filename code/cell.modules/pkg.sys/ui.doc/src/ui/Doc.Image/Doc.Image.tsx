import React, { useRef, useState } from 'react';

import { COLORS, css, CssValue, DEFAULT, FC, t } from './common';
import { DevImageInfo } from './ui/Dev.ImageInfo';
import { LoadFail } from './ui/LoadFail';
import { Util } from './Util';
import { AspectRatio } from './Util.AspectRatio';

/**
 * Type
 */
export type DocImageProps = {
  url?: string;
  width?: number;
  height?: number;
  ratio?: string;
  borderRadius?: number;
  credit?: React.ReactNode;
  draggable?: boolean;
  debug?: { info?: boolean };
  margin?: t.DocBlockMargin;
  style?: CssValue;
  onReady?: t.DocImageReadyHandler;
};

/**
 * Component
 */
const View: React.FC<DocImageProps> = (props) => {
  const {
    url,
    credit,
    borderRadius = DEFAULT.borderRadius,
    draggable = DEFAULT.draggable,
    margin = {},
    debug = { info: false },
  } = props;

  const imgRef = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState<t.DocImageReadyHandlerArgs | undefined>();
  const hasError = Boolean(ready?.error);
  const { width, height } = AspectRatio.wrangle(props);

  /**
   * [Handlers]
   */
  const fireReady = (args: { error?: string } = {}) => {
    const { error } = args;
    const url = props.url ?? '';
    const size = Util.toSize(imgRef.current);
    const ready: t.DocImageReadyHandlerArgs = { url, size, error };
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
      position: 'relative',
      overflow: 'hidden',
      borderRadius,
      width,
      height,
    }),
    image: css({
      display: 'block',
      visibility: ready && !hasError ? 'visible' : 'hidden',
      width,
      height,
    }),
    credit: css({
      marginTop: 3,
      fontSize: 11,
      textAlign: 'right',
      opacity: 0.3,
    }),
    info: css({ Absolute: [null, null, 20, 20] }),
  };

  const elImg = url && (
    <img
      {...styles.image}
      ref={imgRef}
      src={url}
      onLoad={(e) => fireReady()}
      onError={(e) => fireReady({ error: `Failed to load image.` })}
      onDragStart={(e) => {
        if (!draggable) e.preventDefault();
      }}
    />
  );

  const elLoadFail = Boolean(ready?.error) && (
    <LoadFail url={url} borderRadius={borderRadius} height={height} />
  );

  const elInfo = debug.info && ready && !hasError && (
    <DevImageInfo size={ready.size} style={styles.info} />
  );

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>
        {elImg}
        {elLoadFail}
        {elInfo}
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
  AspectRatio: typeof AspectRatio;
};
export const DocImage = FC.decorate<DocImageProps, Fields>(
  View,
  { DEFAULT, Util, AspectRatio },
  { displayName: 'Doc.Image' },
);
