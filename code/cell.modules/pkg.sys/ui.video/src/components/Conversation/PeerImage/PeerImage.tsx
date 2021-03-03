import { Observable, Subject, BehaviorSubject } from 'rxjs';
import {
  takeUntil,
  take,
  takeWhile,
  map,
  filter,
  share,
  delay,
  distinctUntilChanged,
  debounceTime,
  tap,
} from 'rxjs/operators';

import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, rx } from '../common';
import { useDragTarget } from '../../Primitives';

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

  return (
    <div ref={rootRef} {...css(styles.base, props.style)}>
      {src && <div {...styles.image} />}
      {elEmpty}
      {elDragOver}
    </div>
  );
};

/**
 * [Helpers]
 */

/**
 * Source: https://stackoverflow.com/questions/11089732/display-image-from-blob-using-javascript-and-websockets
 */

function toDataUri(file: t.IHttpClientCellFileUpload) {
  const bytes = new Uint8Array(file.data);
  const src = `data:${file.mimetype};base64,${encode(bytes)}`;
  return src;
}

function encode(input: Uint8Array) {
  const keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
  let i = 0;

  while (i < input.length) {
    chr1 = input[i++];
    chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index
    chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;

    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }
    output += keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
  }
  return output;
}
