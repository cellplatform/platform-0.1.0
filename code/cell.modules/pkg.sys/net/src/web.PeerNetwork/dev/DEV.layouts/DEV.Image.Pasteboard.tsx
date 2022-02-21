import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { color, css, CssValue, filesize, rx, slug, Spinner, t } from '../DEV.common';

export type DevImagePasteboardProps = {
  bus: t.EventBus<any>;
  netbus: t.PeerNetbus<any>;
  style?: CssValue;
};

export const DevImagePasteboard: React.FC<DevImagePasteboardProps> = (props) => {
  const netbus = props.netbus as t.PeerNetbus<t.DevEvent>;

  type D = t.DevImagePasteboardUri['data'];
  const [incoming, setIncoming] = useState<{ data: D; tx: string }[]>([]);
  const [imageUri, setImageUri] = useState<string | undefined>();

  const isEmpty = !imageUri;
  const isSpinning = incoming.length > 0;
  const incomingBytes = incoming.reduce((acc, next) => acc + next.data.bytes, 0);

  useEffect(() => {
    const dispose$ = new Subject<void>();
    const $ = netbus.$.pipe(takeUntil(dispose$));
    const incoming$ = rx.payload<t.DevImagePasteboardUriEvent>($, 'DEV/ImagePasteboard');

    /**
     * PASTE from clipboard.
     */
    document.addEventListener('paste', async (e) => {
      const res = await clipboardToDataUri(e);
      const { bytes, mimetype, binary } = res;

      const tx = slug();
      netbus.target.remote({
        type: 'DEV/ImagePasteboard',
        payload: { tx, action: 'paste:presend', data: { bytes, mimetype } },
      });

      netbus.target.remote({
        type: 'DEV/ImagePasteboard',
        payload: { tx, action: 'paste:send', data: { bytes, mimetype, binary } },
      });

      console.log('OUTGOING // pasted', res);

      const uri = await arrayBufferToStringUri(binary);
      setImageUri(uri);
    });

    /**
     * INCOMING [before] data is sent.
     */
    incoming$.pipe(filter((e) => e.action === 'paste:presend')).subscribe((e) => {
      const { data, tx } = e;
      setIncoming((prev) => [...prev, { data, tx }]);
    });

    /**
     * INCOMING data.
     */
    incoming$.pipe(filter((e) => e.action === 'paste:send')).subscribe(async (e) => {
      const { data, tx } = e;

      if (data.binary) {
        const uri = await arrayBufferToStringUri(data.binary);
        setImageUri(uri);
      }

      setIncoming((prev) => prev.filter((item) => item.tx !== tx));
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
      backdropFilter: 'blur(8px)',
    }),
    image: css({
      Absolute: 50,
      backgroundImage: `url(${imageUri})`,
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
    }),
    spinner: {
      base: css({
        Absolute: [10, null, null, 10],
        Flex: 'horizontal-center-center',
      }),
      label: css({ marginLeft: 6 }),
    },
  };

  const elSpinner = isSpinning && (
    <div {...styles.spinner.base}>
      <Spinner size={18} />
      <div {...styles.spinner.label}>{filesize(incomingBytes, { round: 0 })} incoming</div>
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.image} />
      {elSpinner}
    </div>
  );
};

/**
 * [Helpers]
 */

type C = { bytes: number; mimetype: string; binary: Uint8Array };

function clipboardToDataUri(e: ClipboardEvent) {
  return new Promise<C>(async (resolve, reject) => {
    if (!e.clipboardData) return reject('No clipboard data');

    const items = e.clipboardData.items;

    for (const index in items) {
      const item = items[index];
      if (item.kind === 'file') {
        const blob = item.getAsFile();

        if (blob) {
          const binary = await blobToUint8Array(blob);
          const bytes = blob.size;
          const mimetype = blob.type;
          resolve({ mimetype, bytes, binary });
        }
      }
    }
  });
}

const blobToUint8Array = (blob: Blob) => {
  return new Promise<Uint8Array>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (!(result instanceof ArrayBuffer)) {
        return reject('Blob could not be loaded as an ArrayBuffer');
      }
      const data = new Uint8Array(reader.result as ArrayBuffer);
      resolve(data);
    };
    reader.readAsArrayBuffer(blob);
  });
};

const arrayBufferToStringUri = (data: Uint8Array) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const uri = reader.result;
      if (typeof uri === 'string') {
        resolve(uri);
      } else {
        reject('Failed to data convert to URI');
      }
    };
    reader.readAsDataURL(new Blob([data]));
  });
};
