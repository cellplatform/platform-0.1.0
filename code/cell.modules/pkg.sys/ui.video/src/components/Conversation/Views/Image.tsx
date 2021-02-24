import React, { useEffect, useRef, useState } from 'react';
import { animationFrameScheduler } from 'rxjs';
import { filter, observeOn } from 'rxjs/operators';

import { css, CssValue, drag, t, defaultValue } from '../common';

export type ImageProps = {
  bus: t.EventBus<any>;
  src?: string;
  style?: CssValue;
  zoom?: number;
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
  onLoadError?: () => void;
};

export const Image: React.FC<ImageProps> = (props) => {
  const { onLoadStart } = props;
  const bus = props.bus.type<t.PeerEvent>();
  const zoom = defaultValue(props.zoom, 1);

  const imageRef = useRef<HTMLImageElement>(null);

  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const setOffset = (x: number, y: number) => {
    setOffsetX(x);
    setOffsetY(y);
  };

  useEffect(() => {
    if (onLoadStart) onLoadStart();
  }, []); // eslint-disable-line

  const startDrag = (e: React.MouseEvent) => {
    const isAltKeyPressed = e.altKey;

    const el = imageRef.current as HTMLImageElement;
    const dragger = drag.position({ el });
    const startZoom = zoom;

    const events$ = dragger.events$.pipe(observeOn(animationFrameScheduler));
    const drag$ = events$.pipe(filter((e) => e.type === 'DRAG'));

    drag$.pipe(filter((e) => isAltKeyPressed)).subscribe((e) => {
      const diff = e.delta.y / 100;
      const next = Math.max(0.1, startZoom + diff);
      // if (next <= 1) setOffset(0, 0);

      const data = { zoom: next };
      bus.fire({ type: 'Peer/publish', payload: { data } });
    });

    drag$
      .pipe(
        filter((e) => !isAltKeyPressed),
        filter(() => zoom > 1),
      )
      .subscribe((e) => {
        const { x, y } = e.delta;

        // console.log('e.start', e.start, x, y);

        setOffset(x, y);
      });
  };

  const styles = {
    base: css({
      transform: `scale(${zoom}) translate(${offsetX}px, ${offsetY}px)`,
    }),
  };

  // console.log('-------------------------------------------');
  // console.log('translateX', offsetX);
  // console.log('translateY', offsetY);
  // console.log('transform', transform);

  return (
    <img
      {...css(styles.base, props.style)}
      ref={imageRef}
      onMouseDown={startDrag}
      onDragStart={(e) => e.preventDefault()}
      src={props.src}
      onLoad={props.onLoadComplete}
      onError={(e) => props.onLoadError}
    />
  );
};
