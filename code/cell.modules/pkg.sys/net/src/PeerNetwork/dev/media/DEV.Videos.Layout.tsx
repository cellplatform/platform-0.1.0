import React, { useEffect, useRef, useState } from 'react';
import { filter } from 'rxjs/operators';
import { DevImageDraggable } from './DEV.Image.Draggable';

import { useLocalPeer } from '../../hook';
import {
  MotionDraggable,
  MotionDraggableEvent,
  MotionDraggableDef,
  Button,
  color,
  css,
  CssValue,
  PeerNetwork,
  rx,
  t,
  useResizeObserver,
  VideoStream,
} from '../common';
import { DevVideo } from './DEV.Video';

export type DevVideosLayoutProps = {
  bus: t.EventBus<any>;
  netbus: t.PeerBus<any>;
  style?: CssValue;
};

export const DevVideosLayout: React.FC<DevVideosLayoutProps> = (props) => {
  const { bus } = props;
  const netbus = props.netbus.type<t.DevGroupEvent>();
  const self = netbus.self;
  const source = self;

  const baseRef = useRef<HTMLDivElement>(null);
  const resize = useResizeObserver(baseRef);

  const local = useLocalPeer({ self, bus });
  const [dragbus, setDragbus] = useState<t.EventBus<any>>();

  const [fullscreenMedia, setFullscreenMedia] = useState<MediaStream | undefined>();
  const handleFullscreenMediaClick = (stream?: MediaStream) => {
    setFullscreenMedia(stream);
    const media = !stream ? undefined : { id: stream.id };
    netbus.target.remote({
      type: 'DEV/group/layout/fullscreenMedia',
      payload: { source, media },
    });
  };

  useEffect(() => {
    const events = PeerNetwork.Events(bus);
    const dragBus = rx.bus<MotionDraggableEvent>();
    const dragEvents = MotionDraggable.Events(dragBus);
    setDragbus(dragBus);

    const namespace = 'video/avatars';

    /**
     * Monitor movement of video items that have been "dragged"
     * and broadcast these changes to other peers.
     */
    dragEvents.item.move$.pipe(filter((e) => e.via === 'drag')).subscribe(async (e) => {
      const { id, lifecycle } = e;
      const { x, y } = e.status.position;
      const items = [{ id, x, y }];
      netbus.target.remote({
        type: 'DEV/group/layout/items/change',
        payload: { source, lifecycle, items, namespace },
      });
    });

    /**
     * Monitor remote notifications of video items moving.
     */
    rx.payload<t.DevGroupLayoutItemsChangeEvent>(netbus.event$, 'DEV/group/layout/items/change')
      .pipe(
        filter((e) => e.namespace === namespace),
        filter((e) => e.source !== self),
        filter((e) => e.lifecycle === 'complete'),
      )
      .subscribe((e) => {
        e.items.forEach(async (item) => {
          const { id, x, y } = item;
          dragEvents.item.change.start({ id, x, y });
        });
      });

    /**
     * Monitor remote notifications for full-screen media.
     */
    rx.payload<t.DevGroupLayoutFullscreenMediaEvent>(
      netbus.event$,
      'DEV/group/layout/fullscreenMedia',
    )
      .pipe(filter((e) => e.source !== self))
      .subscribe(async (e) => {
        const { media } = e;
        if (!media) setFullscreenMedia(undefined);
        if (media) {
          const id = media.id;
          const localVideo = await events.media(self).video();
          const status = await events.status(self).get();

          const stream =
            localVideo?.media?.id === id
              ? localVideo.media
              : (status.peer?.connections ?? [])
                  .filter((item) => item.kind === 'media/video')
                  .map((item) => item as t.PeerConnectionMediaStatus)
                  .find((item) => item.media?.id === id)?.media;

          setFullscreenMedia(stream);
        }
      });

    /**
     * Ensure local video is open.
     */
    events.media(self).video();

    return () => {
      events.dispose();
      dragEvents.dispose();
    };
  }, []); // eslint-disable-line

  const styles = {
    base: css({ flex: 1, backgroundColor: color.format(1) }),
    draggable: css({ Absolute: 20 }),
    video: {
      outer: css({
        boxSizing: 'border-box',
        padding: 10,
        paddingBottom: 12,
        borderRadius: 10,
        backgroundColor: color.format(0.4),
        backdropFilter: `blur(6px)`,
      }),
      fullscreen: {
        base: css({ Absolute: 0 }),
        footer: css({
          Absolute: [null, 0, 0, 0],
          padding: 10,
          Flex: 'horizontal-spaceBetween-center',
          backgroundColor: color.format(-0.3),
          backdropFilter: `blur(6px)`,
        }),
      },
    },
  };

  const items: MotionDraggableDef[] = [];

  const addVideo = (stream?: MediaStream) => {
    if (!stream) return;
    const el = (
      <div {...styles.video.outer} onDoubleClick={() => handleFullscreenMediaClick(stream)}>
        <DevVideo
          bus={bus}
          kind={'media/video'}
          stream={stream}
          show={{ proplist: false, waveform: true }}
          selected={{ showBorder: false }}
        />
      </div>
    );
    items.push({ id: stream.id, width: 150, height: 135, el });
  };

  addVideo(local.media.video);
  local.connections
    .filter((e) => e.kind === 'media/video')
    .map((e) => e as t.PeerConnectionMediaStatus)
    .forEach((e) => addVideo(e.media));

  const elFullscreenVideo = resize.ready && fullscreenMedia && (
    <div {...styles.video.fullscreen.base}>
      <VideoStream
        stream={fullscreenMedia}
        width={resize.rect.width}
        height={resize.rect.height}
        isMuted={true}
        borderRadius={0}
      />
      <div {...styles.video.fullscreen.footer}>
        <div />
        <Button
          style={{ color: color.format(1) }}
          onClick={() => handleFullscreenMediaClick(undefined)}
          label={'Close'}
        ></Button>
      </div>
    </div>
  );

  const elBody = resize.ready && (
    <>
      <DevImageDraggable bus={bus} netbus={netbus} />
      {elFullscreenVideo}
      {dragbus && <MotionDraggable bus={dragbus} style={styles.draggable} items={items} />}
    </>
  );

  return (
    <div ref={baseRef} {...css(styles.base, props.style)}>
      {elBody}
    </div>
  );
};
