import React from 'react';
import { ObjectView } from 'sys.ui.dev';

import { COLORS, css, CssValue, t, useDragTarget, useLocalPeer } from './DEV.common';
import { DevNetwork } from './DEV.network';

export type DevRootLayoutProps = {
  bus: t.EventBus<any>;
  netbus: t.PeerNetbus<any>;
  debugJson?: boolean;
  collapse?: boolean | { data?: boolean; media?: boolean };
  cards?: { data?: boolean; media?: boolean };
  others?: { headerVideos?: boolean };
  style?: CssValue;
};

export const DevRootLayout: React.FC<DevRootLayoutProps> = (props) => {
  const { netbus, bus } = props;
  const self = useLocalPeer({ bus, self: netbus.self });

  /**
   * NOTE: This drag monitor is setup to prevent arbitrarily dropped
   *       files from loading into a new tab (cancel default browser event).
   *
   *       This same hook can then be used within sub-components to actually
   *       capture and work with OS level file drops as per each component's context.
   */
  const drag = useDragTarget<HTMLDivElement>();

  const styles = {
    base: css({
      Absolute: 0,
      Flex: 'horizontal-stretch-stretch',
      color: COLORS.DARK,
      overflow: 'hidden',
    }),
    left: css({ flex: 1, display: 'flex' }),
    middle: css({ Flex: 'vertical-stretch-end' }),
    right: css({
      flex: 1,
      padding: 20,
      maxWidth: 350,
      Scroll: true,
    }),
    verticalRule: css({
      flex: 1,
      width: 1,
      borderLeft: `solid 1px ${COLORS.MAGENTA}`,
      borderRight: `solid 1px ${COLORS.MAGENTA}`,
      opacity: 0.3,
    }),
  };

  const elLeft = self.status && (
    <div {...styles.left}>
      <DevNetwork
        bus={bus}
        netbus={netbus}
        collapse={props.collapse}
        cards={props.cards}
        others={props.others}
        self={{
          id: netbus.self,
          status: self.status,
          media: self.media,
        }}
      />
    </div>
  );

  const elRight = props.debugJson && (
    <>
      <div {...styles.middle}>
        <div {...styles.verticalRule} />
      </div>
      <div {...styles.right}>
        <ObjectView name={'state'} data={self.status} expandLevel={5} fontSize={10} />
      </div>
    </>
  );

  return (
    <div ref={drag.ref} {...css(styles.base, props.style)}>
      {elLeft}
      {elRight}
    </div>
  );
};
