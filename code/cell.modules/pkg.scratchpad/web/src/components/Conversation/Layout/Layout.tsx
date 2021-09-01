import React, { useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { useZoomDrag, Zoom } from 'sys.ui.primitives/lib/ui/Zoom';

import { color, COLORS, css, CssValue, PeerJS, t, useResizeObserver, value, rx } from '../common';
import { LayoutFooter } from './Layout.VideoBar';

export type LayoutProps = {
  bus: t.EventBus<any>;
  peer: PeerJS;
  model?: t.ConversationState;
  style?: CssValue;
};

export const Layout: React.FC<LayoutProps> = (props) => {
  const { model, peer } = props;
  const bus = rx.busAsType<t.ConversationEvent>(props.bus);

  const bodyRef = useRef<HTMLDivElement>(null);
  const bodyResize = useResizeObserver(bodyRef);

  useEffect(() => {
    const dispose$ = new Subject<void>();

    const publishSize = (width: number, height: number) => {
      const id = peer.id;
      const body = {
        width: value.round(width, 0),
        height: value.round(height, 0),
      };
      const peers: t.PartialDeep<t.ConversationStatePeers> = {
        [id]: { resolution: { body } },
      };
      bus.fire({
        type: 'Conversation/publish',
        payload: { kind: 'model', data: { peers: peers as any } },
      });
    };

    bodyResize.$.pipe(takeUntil(dispose$), debounceTime(300)).subscribe((e) => {
      publishSize(e.width, e.height);
    });

    return () => dispose$.next();
  }, []); // eslint-disable-line

  const styles = {
    base: css({
      flex: 1,
      Flex: 'vertical-stretch-stretch',
      color: COLORS.DARK,
      userSelect: 'none',
      overflow: 'hidden',
    }),
    videoBar: css({
      Absolute: [15, 15, null, 15],
    }),
    body: {
      outer: css({
        Absolute: 0,
        display: 'flex',
        position: 'relative',
      }),
      zoom: { flex: 1 },
    },
  };

  useZoomDrag({
    ref: bodyRef,
    zoom: model?.zoom,
    offset: model?.offset,
    min: { zoom: 0.5 },
    max: { zoom: 5 },
    canZoom: (e) => e.mouse.altKey,
    canPan: (e) => !e.mouse.altKey,
    onZoom: (e) => {
      bus.fire({
        type: 'Conversation/publish',
        payload: { kind: 'model', data: { zoom: e.next } },
      });
    },
    onPan: (e) => {
      bus.fire({
        type: 'Conversation/publish',
        payload: { kind: 'model', data: { offset: e.next } },
      });
    },
  });

  const resetZoom = () => {
    bus.fire({
      type: 'Conversation/publish',
      payload: { kind: 'model', data: { zoom: undefined, offset: undefined } },
    });
  };

  const elBody = (
    <div ref={bodyRef} {...styles.body.outer} onDoubleClick={resetZoom}>
      <Zoom zoom={model?.zoom} offset={model?.offset} style={styles.body.zoom}>
        {props.children}
      </Zoom>
    </div>
  );

  const elVideoBar = (
    <div {...styles.videoBar}>
      <LayoutFooter bus={bus} peer={peer} model={model} zoom={model?.videoZoom} />
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elBody}
      {elVideoBar}
      {/* {peer && <LayoutFooter bus={bus} peer={peer} model={model} zoom={model?.videoZoom} />} */}
    </div>
  );
};
