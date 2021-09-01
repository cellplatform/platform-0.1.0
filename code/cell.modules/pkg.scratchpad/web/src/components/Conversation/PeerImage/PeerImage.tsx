import React, { useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { toDataUri } from './util';
import { ModuleIcon } from '../ModuleIcon';

import { useDragTarget } from '../../Primitives';
import { COLORS, css, CssValue, rx, t, bundle, color } from '../common';

export type PeerImageProps = {
  bus: t.EventBus<any>;
  style?: CssValue;
};

export const PeerImage: React.FC<PeerImageProps> = (props) => {
  const bus = rx.busAsType<t.ConversationEvent>(props.bus);

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

    rx.payload<t.ConversationFileEvent>(bus.$, 'Conversation/file')
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
      color: COLORS.DARK,
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
    dragOver: {
      base: css({
        Absolute: 0,
        Flex: 'center-center',
        pointerEvents: 'none',
      }),
      content: css({
        PaddingY: 20,
        PaddingX: 120,
        border: `solid 1px ${color.format(-0.06)}`,
        borderRadius: 10,
        boxShadow: `0 0px 70px 0 ${color.format(-0.12)}`,
        backgroundColor: color.format(0.75),
      }),
    },
  };

  const elEmpty = !dragTarget.isDragOver && !src && (
    <ModuleIcon style={{ pointerEvents: 'none' }} />
  );
  const elDragOver = dragTarget.isDragOver && (
    <div {...styles.dragOver.base}>
      <div {...styles.dragOver.content}>Drop File</div>
    </div>
  );
  const elImage = src && <div {...styles.image} />;

  return (
    <div ref={rootRef} {...css(styles.base, props.style)}>
      {elImage}
      {elEmpty}
      {elDragOver}
    </div>
  );
};
