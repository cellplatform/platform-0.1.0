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
import {
  color,
  css,
  CssValue,
  t,
  rx,
  PeerNetwork,
  useResizeObserver,
  VideoStream,
  Button,
} from '../common';
import { DevVideo } from './DEV.Video';
import { useLocalPeer } from '../../hook';

import { useClickWithin, useClickOutside } from '@platform/react';

import {
  MotionDraggable,
  MotionDraggableItem,
  MotionDraggableEvent,
} from 'sys.ui.primitives/lib/components/Draggable.Motion';

export type DevVideosLayoutProps = {
  self: t.PeerId;
  bus: t.EventBus<any>;
  netbus: t.NetBus<any>;
  style?: CssValue;
};

export const DevVideosLayout: React.FC<DevVideosLayoutProps> = (props) => {
  const { self, bus } = props;
  const source = self;
  const netbus = props.netbus.type<t.DevGroupEvent>();

  const baseRef = useRef<HTMLDivElement>(null);
  const resize = useResizeObserver(baseRef);

  const local = useLocalPeer({ self, bus });
  const [dragBus, setDragBus] = useState<t.EventBus<any>>();

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
    setDragBus(dragBus);

    /**
     * Monitor movement of video items that have been "dragged"
     * and broadcast move updates to other peers.
     */
    dragEvents.item.move.$.pipe(filter((e) => e.via === 'drag')).subscribe(async (e) => {
      const lifecycle = e.lifecycle;
      const { id } = e.status;
      const { x, y } = e.status.position;
      const items = [{ id, x, y }];
      netbus.target.remote({
        type: 'DEV/group/layout/items/move',
        payload: { source, lifecycle, items },
      });
    });

    /**
     * Monitor remote notifications of video items moving.
     */
    rx.payload<t.DevGroupLayoutItemsMoveEvent>(netbus.event$, 'DEV/group/layout/items/move')
      .pipe(
        filter((e) => e.source !== self),
        filter((e) => e.lifecycle === 'complete'),
      )
      .subscribe((e) => {
        e.items.forEach(async (item) => {
          const { id, x, y } = item;
          dragEvents.item.move.start({ id, x, y });
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
          Flex: 'horizontal-center-center',
          backgroundColor: color.format(-0.3),
          backdropFilter: `blur(6px)`,
        }),
      },
    },
  };

  const items: MotionDraggableItem[] = [];

  const addVideo = (stream?: MediaStream) => {
    if (!stream) return;
    const el = (
      <div {...styles.video.outer} onDoubleClick={() => handleFullscreenMediaClick(stream)}>
        <DevVideo
          bus={bus}
          kind={'media/video'}
          stream={stream}
          show={{ proplist: false, waveform: true }}
          selected={{ showBorder: true }}
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
        <Button
          style={{ color: color.format(1) }}
          onClick={() => handleFullscreenMediaClick(undefined)}
        >
          Close
        </Button>
      </div>
    </div>
  );

  const elBody = resize.ready && (
    <>
      {elFullscreenVideo}
      {dragBus && <MotionDraggable bus={dragBus} style={styles.draggable} items={items} />}
    </>
  );

  return (
    <div ref={baseRef} {...css(styles.base, props.style)}>
      {elBody}
    </div>
  );
};
