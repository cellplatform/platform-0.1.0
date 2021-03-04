import React, { useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { toDataUri } from './util';

import { useDragTarget } from '../../Primitives';
import { css, CssValue, rx, t } from '../common';

export type PeerImageProps = {
  bus: t.EventBus<any>;
  style?: CssValue;
};

export const PeerImage: React.FC<PeerImageProps> = (props) => {
  const bus = props.bus.type<t.ConversationEvent>();

  const rootRef = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string | undefined>();

  const dragTarget = useDragTarget(rootRef);

  useEffect(() => {
    const file = dragTarget.dropped?.files[0];
    if (file && file.mimetype) {
      setSrc(toDataUri(file));
      bus.fire({ type: 'Conversation/publish', payload: { kind: 'file', data: file } });
    }
  }, [dragTarget.dropped, bus]);

  useEffect(() => {
    const dispose$ = new Subject<void>();

    rx.payload<t.ConversationFileEvent>(bus.event$, 'Conversation/file')
      .pipe(takeUntil(dispose$))
      .subscribe((e) => {
        setSrc(toDataUri(e.data));
        console.log('e', e);
      });

    return () => dispose$.next();
  }, [bus]);

  const styles = {
    base: css({
      position: 'relative',
      Flex: 'center-center',
    }),
    image: css({
      Absolute: 0,
      backgroundImage: src ? `url(${src})` : undefined,
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      opacity: dragTarget.isDragOver ? 0.1 : 1,
      pointerEvents: 'none',
    }),
  };

  const elEmpty = !dragTarget.isDragOver && !src && <div>Drag and Drop Image</div>;
  const elDragOver = dragTarget.isDragOver && <div>Drop File</div>;
  const elImage = src && <div {...styles.image} />;

  return (
    <div ref={rootRef} {...css(styles.base, props.style)}>
      {elImage}
      {elEmpty}
      {elDragOver}
    </div>
  );
};
