import React, { useEffect, useRef, useState } from 'react';

import { color, COLORS, css, CssValue, PeerJS, t } from '../common';
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
  const bus = props.bus.type<t.PeerEvent>();

  const styles = {
    base: css({
      flex: 1,
      Flex: 'vertical-stretch-stretch',
      color: COLORS.DARK,
      userSelect: 'none',
      overflow: 'hidden',
    }),
    body: css({ flex: 1, display: 'flex' }),
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
            type: 'Conversation/publish',
            payload: { data: { selected: e.path } },
          });
        }}
      />
    ));

  return (
    <div {...css(styles.base, props.style)}>
      {peer && <LayoutFooter bus={bus} peer={peer} zoom={model?.videoZoom} />}
      <div {...styles.body}>{elBody}</div>
    </div>
  );
};
