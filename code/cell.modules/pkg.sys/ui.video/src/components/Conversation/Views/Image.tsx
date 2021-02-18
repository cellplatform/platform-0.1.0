import React, { useEffect, useRef, useState } from 'react';
import { animationFrameScheduler, Subject } from 'rxjs';
import { takeUntil, filter, observeOn } from 'rxjs/operators';

import { css, CssValue, drag, events } from '../common';
import { Scale } from './Scale';

export type ImageProps = {
  src?: string;
  style?: CssValue;
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
  onLoadError?: () => void;
};

export const Image: React.FC<ImageProps> = (props) => {
  const { onLoadStart } = props;
  const imageRef = useRef<HTMLImageElement>(null);
  const [zoom, setZoom] = useState<number>(1);

  useEffect(() => {
    if (onLoadStart) onLoadStart();
  }, []); // eslint-disable-line

  const startDrag = (e: React.MouseEvent) => {
    if (!e.altKey) return;

    const el = imageRef.current as HTMLImageElement;
    const dragger = drag.position({ el });
    const startZoom = zoom;

    dragger.events$
      .pipe(
        filter((e) => e.type === 'DRAG'),
        observeOn(animationFrameScheduler),
      )
      .subscribe((e) => {
        const diff = e.delta.y / 100;
        const next = Math.max(0.1, startZoom + diff);
        setZoom(next);
      });
  };

  const styles = {
    base: css({
      transform: `scale(${zoom})`,
    }),
  };

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
