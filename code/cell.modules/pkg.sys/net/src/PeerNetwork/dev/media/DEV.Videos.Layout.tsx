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
import { color, css, CssValue, t, rx, PeerNetwork } from '../common';
import { DevVideo } from './DEV.Video';
import { useLocalPeer } from '../../hook';

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
  const netbus = props.netbus.type<t.DevGroupEvent>();

  const local = useLocalPeer({ self, bus });
  const [dragBus, setDragBus] = useState<t.EventBus<any>>();

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
        payload: { source: self, lifecycle, items },
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
        padding: 8,
        borderRadius: 25,
        backgroundColor: color.format(0.7),
        backdropFilter: `blur(5px)`,
      }),
    },
  };

  const items: MotionDraggableItem[] = [];

  const addVideo = (stream?: MediaStream) => {
    if (!stream) return;
    const el = (
      <div {...styles.video.outer}>
        <DevVideo
          bus={bus}
          kind={'media/video'}
          stream={stream}
          show={{ proplist: false, waveform: true }}
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

  return (
    <div {...css(styles.base, props.style)}>
      {dragBus && <MotionDraggable bus={dragBus} style={styles.draggable} items={items} />}
    </div>
  );
};
