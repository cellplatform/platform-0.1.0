import React, { useEffect, useRef, useState } from 'react';
import { animationFrameScheduler } from 'rxjs';
import { filter, observeOn } from 'rxjs/operators';

import { css, CssValue, drag, t, defaultValue } from '../common';

export type ImageProps = {
  bus: t.EventBus<any>;
  src?: string;
  style?: CssValue;
  zoom?: number;
  offset?: { x: number; y: number };
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
  onLoadError?: () => void;
};

export const Image: React.FC<ImageProps> = (props) => {
  const { onLoadStart } = props;
  const bus = props.bus.type<t.ConversationEvent>();
  const zoom = defaultValue(props.zoom, 1);
  const offset = props.offset || { x: 0, y: 0 };
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (onLoadStart) onLoadStart();
  }, []); // eslint-disable-line

  const startDrag = (e: React.MouseEvent) => {
    const isAltKeyPressed = e.altKey;

    const el = imageRef.current as HTMLImageElement;
    const dragger = drag.position({ el });
    const startZoom = zoom;
    const startOffset = offset;

    const events$ = dragger.events$.pipe(observeOn(animationFrameScheduler));
    const drag$ = events$.pipe(filter((e) => e.type === 'DRAG'));

    // Zoom.
    drag$.pipe(filter((e) => isAltKeyPressed)).subscribe((e) => {
      const diff = e.delta.y / 100;
      const next = Math.max(0.1, startZoom + diff);
      bus.fire({ type: 'Conversation/publish', payload: { kind: 'model', data: { zoom: next } } });
    });

    // Pan ({x,y} offset).
    drag$.pipe(filter((e) => !isAltKeyPressed)).subscribe((e) => {
      const x = e.delta.x + startOffset.x;
      const y = e.delta.y + startOffset.y;
      bus.fire({
        type: 'Conversation/publish',
        payload: { kind: 'model', data: { offset: { x, y } } },
      });
    });
  };

  const resetOffset = () => {
    bus.fire({
      type: 'Conversation/publish',
      payload: { kind: 'model', data: { zoom: undefined, offset: undefined } },
    });
  };

  const styles = {
    base: css({
      transform: `scale(${zoom}) translate(${offset.x}px, ${offset.y}px)`,
    }),
  };

  return (
    <img
      {...css(styles.base, props.style)}
      ref={imageRef}
      onMouseDown={startDrag}
      onDragStart={(e) => e.preventDefault()}
      onDoubleClick={resetOffset}
      src={props.src}
      onLoad={props.onLoadComplete}
      onError={(e) => props.onLoadError}
    />
  );
};
