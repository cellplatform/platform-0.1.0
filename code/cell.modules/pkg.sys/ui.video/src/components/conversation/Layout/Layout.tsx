import React, { useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { color, COLORS, css, CssValue, PeerJS, t, useResizeObserver } from '../common';
import { Diagram } from '../Diagram';
import { LayoutFooter } from './Layout.Footer';

export type LayoutProps = {
  bus: t.EventBus<any>;
  peer: PeerJS;
  model?: t.ConversationState;
  body?: JSX.Element;
  style?: CssValue;
};

export const Layout: React.FC<LayoutProps> = (props) => {
  const { model, peer } = props;
  const bus = props.bus.type<t.ConversationEvent>();

  const bodyRef = useRef<HTMLDivElement>(null);
  const bodyResize = useResizeObserver(bodyRef);

  useEffect(() => {
    const dispose$ = new Subject<void>();

    const publishSize = (width: number, height: number) => {
      const id = peer.id;
      const body = { width, height };
      const peers: t.DeepPartial<t.ConversationStatePeers> = {
        [id]: { resolution: { body } },
      };
      bus.fire({
        type: 'Conversation/model/publish',
        payload: { data: { peers: peers as any } },
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
    body: css({
      flex: 1,
      display: 'flex',
      position: 'relative',
    }),
  };

  const elBody =
    props.body ||
    (model && (
      <Diagram
        bus={bus}
        dir={model.imageDir}
        zoom={model.zoom}
        offset={model.offset}
        selected={model.selected}
        onSelect={(e) => {
          bus.fire({
            type: 'Conversation/model/publish',
            payload: { data: { selected: e.path } },
          });
        }}
      />
    ));

  return (
    <div {...css(styles.base, props.style)}>
      {peer && <LayoutFooter bus={bus} peer={peer} zoom={model?.videoZoom} />}
      <div ref={bodyRef} {...styles.body}>
        {elBody}
      </div>
    </div>
  );
};
