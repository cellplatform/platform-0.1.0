import React, { useEffect, useRef, useState } from 'react';
import { filter } from 'rxjs/operators';

import {
  COLORS,
  css,
  CssValue,
  FileUtil,
  Icons,
  MotionDraggable,
  MotionDraggableDef,
  MotionDraggableEvent,
  rx,
  t,
  useDragTarget,
  useResizeObserver,
} from '../common';

export type DevImageDraggableProps = {
  bus: t.EventBus<any>;
  netbus: t.PeerBus<any>;
  style?: CssValue;
};

export const DevImageDraggable: React.FC<DevImageDraggableProps> = (props) => {
  const netbus = props.netbus.type<t.DevEvent>();
  const self = netbus.self;
  const source = self;

  const baseRef = useRef<HTMLDivElement>(null);

  const [dragbus, setDragbus] = useState<t.EventBus<any>>();
  const [image, setImage] =
    useState<{ uri: string; filename: string; mimetype: string } | undefined>();

  const resize = useResizeObserver(baseRef);
  const drag = useDragTarget(baseRef, async (e) => {
    const file = e.files[0];
    if (file) {
      const { mimetype, data, filename } = file;
      netbus.fire({
        type: 'DEV/group/image/load',
        payload: { source, mimetype, data, filename },
      });
    }
  });

  useEffect(() => {
    const dragbus = rx.bus<MotionDraggableEvent>();
    const dragEvents = MotionDraggable.Events(dragbus);
    setDragbus(dragbus);

    const namespace = 'image/draggable';

    /**
     * Load image data from network.
     */
    rx.payload<t.DevGroupLayoutImageLoadEvent>(netbus.event$, 'DEV/group/image/load')
      .pipe()
      .subscribe(async (e) => {
        const { data, mimetype, filename } = e;
        const uri = await FileUtil.toUri(data);
        setImage({ uri, mimetype, filename });
      });

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
     * Monitor scale of video items that have changed
     * and broadcast these changes to other peers.
     */
    dragEvents.item.scale$.pipe(filter((e) => e.via === 'wheel')).subscribe(async (e) => {
      const { id, lifecycle } = e;
      const { scale } = e.status.size;
      const items = [{ id, scale }];
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
          const { id, x, y, scale } = item;
          dragEvents.item.change.start({ id, x, y, scale });
        });
      });

    return () => {
      dragEvents.dispose();
    };
  }, []); // eslint-disable-line

  const styles = {
    base: css({
      Absolute: 0,
      overflow: 'hidden',
    }),
    drag: {
      overlay: css({ Absolute: 0, Flex: 'vertical-center-center' }),
      icon: css({ marginBottom: 6, opacity: 0.2 }),
    },
    draggable: css({
      Absolute: [
        0 - resize.rect.height / 2,
        0 - resize.rect.width / 2,
        0 - resize.rect.height / 2,
        0 - resize.rect.width / 2,
      ],
    }),
  };

  const elDragOverlay = drag.isDragOver && (
    <div {...styles.drag.overlay}>
      <Icons.Upload.Box size={46} style={styles.drag.icon} color={COLORS.DARK} />
    </div>
  );

  const items: MotionDraggableDef[] = [];

  if (image && resize.ready) {
    const { width, height } = resize.rect;

    const styles = {
      base: css({
        Absolute: 0,
        backgroundRepeat: 'no-repeat',
        backgroundImage: `url(${image.uri})`,
        backgroundSize: `contain`,
        backgroundPosition: `center center`,
      }),
    };

    const el = <div {...styles.base} />;
    items.push({
      id: 'image',
      width,
      height,
      el,
      scaleable: { min: 0.3, max: 5 },
    });
  }

  const elBody = resize.ready && (
    <>
      {dragbus && <MotionDraggable bus={dragbus} style={styles.draggable} items={items} />}
      {elDragOverlay}
    </>
  );

  return (
    <div ref={baseRef} {...css(styles.base, props.style)}>
      {elBody}
    </div>
  );
};
