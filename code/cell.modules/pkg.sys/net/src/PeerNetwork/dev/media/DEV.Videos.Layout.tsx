import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, rx, PeerNetwork } from '../common';
import { DevVideo } from './DEV.Video';

import {
  MotionDraggable,
  MotionDraggableItem,
  MotionDraggableEvent,
} from 'sys.ui.primitives/lib/components/Draggable.Motion';

export type DevVideosLayoutProps = {
  self: t.PeerId;
  bus: t.EventBus<any>;
  style?: CssValue;
};

export const DevVideosLayout: React.FC<DevVideosLayoutProps> = (props) => {
  const { self, bus } = props;

  const [dragBus, setDragBus] = useState<t.EventBus<any>>();
  const [selfVideo, setSelfVideo] = useState<MediaStream>();

  useEffect(() => {
    const events = PeerNetwork.Events(bus);
    const dragBus = rx.bus<MotionDraggableEvent>();
    const dragEvents = MotionDraggable.Events(dragBus);
    setDragBus(dragBus);

    events
      .media(self)
      .video()
      .then((e) => {
        if (e.media) setSelfVideo(e.media);
      });

    return () => {
      events.dispose();
      dragEvents.dispose();
    };
  }, []); // eslint-disable-line

  const styles = {
    base: css({ flex: 1, backgroundColor: color.format(1) }),
    draggable: css({ Absolute: 20 }),
    content: css({ padding: 20, borderRadius: 20, flex: 1 }),
  };

  const items: MotionDraggableItem[] = [
    { width: 100, height: 100, el: <div {...styles.content}>Foo-1</div> },
    {
      width: 150,
      height: 160,
      el() {
        return <DevVideo bus={bus} kind={'media/video'} stream={selfVideo} />;
      },
    },
  ];

  return (
    <div {...css(styles.base, props.style)}>
      {dragBus && <MotionDraggable bus={dragBus} style={styles.draggable} items={items} />}
    </div>
  );
};
