import { Observable, Subject, BehaviorSubject, firstValueFrom } from 'rxjs';
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
import { color, css, CssValue, t, rx, slug } from '../common';

export type DevImagePasteboardProps = {
  bus: t.EventBus<any>;
  netbus: t.PeerBus<any>;
  style?: CssValue;
};

export const DevImagePasteboard: React.FC<DevImagePasteboardProps> = (props) => {
  // const { netbus } = props;
  const netbus = props.netbus as t.PeerBus<t.DevEvent>;

  const [imageUri, setImageUri] = useState<string | undefined>();
  const isEmpty = !imageUri;

  useEffect(() => {
    const dispose$ = new Subject<void>();
    const $ = netbus.$.pipe(takeUntil(dispose$));
    const incoming$ = rx.payload<t.DevImagePasteboardUriEvent>($, 'DEV/ImagePasteboard');

    /**
     * PASTE from clipboard.
     */
    document.addEventListener('paste', async (e) => {
      const data = await clipboardToDataUri(e);

      const { uri, bytes, mimetype } = data;

      // const dataUri = data.uri;
      setImageUri(uri);

      const tx = slug();
      netbus.target.remote({
        type: 'DEV/ImagePasteboard',
        payload: { tx, action: 'paste:presend', data: { bytes, mimetype } },
      });

      netbus.target.remote({
        type: 'DEV/ImagePasteboard',
        payload: { tx, action: 'paste:send', data: { uri, bytes, mimetype } },
      });

      console.log('OUTGOING // pasted', data);
    });

    /**
     * INCOMING [before] data is sent.
     */
    incoming$.pipe(filter((e) => e.action === 'paste:presend')).subscribe((e) => {
      // if (e.data.uri) setImageUri(e.data.uri);
      //
      console.log('REMOTE INCOMING // paste board (size)', e.data.bytes, e.data.mimetype);
      //
    });

    /**
     * INCOMING data.
     */
    incoming$.pipe(filter((e) => e.action === 'paste:send')).subscribe((e) => {
      if (e.data.uri) setImageUri(e.data.uri);
      //
      console.log('REMOTE INCOMING // paste board (data)', e);
      //
    });

    return () => dispose$.next();
  }, []); // eslint-disable-line

  const styles = {
    base: css({
      Absolute: 0,
      backgroundColor: isEmpty ? color.format(0.7) : color.format(1),
      backdropFilter: 'blur(8px)',
    }),
    imageBorder: css({
      Absolute: 50,
      // backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      backdropFilter: 'blur(8px)',
    }),
    image: css({
      Absolute: 50,
      backgroundImage: `url(${imageUri})`,
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      {/* <div {...styles.imageBorder} /> */}
      <div {...styles.image} />
      {/* <img {...styles.image} src={imageUri} /> */}
    </div>
  );
};

/**
 * [Helpers]
 */

type C = { uri: string; bytes: number; mimetype: string };

function clipboardToDataUri(e: ClipboardEvent) {
  return new Promise<C>((resolve, reject) => {
    if (!e.clipboardData) return reject('No clipboard data');

    const items = e.clipboardData.items;

    for (const index in items) {
      const item = items[index];
      if (item.kind === 'file') {
        const blob = item.getAsFile();

        if (blob) {
          const bytes = blob.size;
          const mimetype = blob.type;
          const reader = new FileReader();
          reader.onload = function (event) {
            const uri = event.target?.result as string;
            return resolve({ uri, mimetype, bytes });
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  });
}
