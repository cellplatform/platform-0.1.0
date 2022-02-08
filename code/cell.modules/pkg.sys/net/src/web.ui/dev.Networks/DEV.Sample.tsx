import React from 'react';

import { color, BulletList, css, CssValue, t, COLORS, Icons } from './DEV.common';
import { DevSampleNetwork } from './DEV.Network';

export type DevSampleProps = {
  networks: t.PeerNetwork[];
  style?: CssValue;
};

export const DevSample: React.FC<DevSampleProps> = (props) => {
  const { networks = [] } = props;

  type D = { network: t.PeerNetwork };

  const isEmpty = networks.length === 0;
  const items = networks.map<{ data: D }>((network) => ({ data: { network } }));

  /**
   * [Render]
   */
  const styles = {
    base: css({
      boxSizing: 'border-box',
      minWidth: 450,
    }),
    empty: {
      base: css({
        minWidth: 660,
        Flex: 'center-center',
      }),
      body: css({
        Flex: 'y-center-center',
        fontSize: 12,
        fontStyle: 'italic',
        opacity: 0.3,
      }),
    },
  };

  const elEmpty = isEmpty && (
    <div {...styles.empty.base}>
      <div {...styles.empty.body}>
        <Icons.Antenna size={45} color={color.format(-0.3)} style={{ marginBottom: 6 }} />
        <div>No networks to display</div>
      </div>
    </div>
  );

  const elClientCards = (
    <BulletList.Layout
      orientation={'y'}
      bullet={{ edge: 'near', size: 60 }}
      spacing={50}
      items={items}
      renderers={{
        bullet: (e) => {
          const data = e.data as D;
          const network = data.network;

          /**
           * TODO 🐷
           * - Get peers
           */
          const isConnected = false; // TODO 🐷
          const lineColor = isConnected ? COLORS.CYAN_BLUE : color.alpha(COLORS.DARK, 0.1);

          return (
            <BulletList.Renderers.Bullet.ConnectorLines
              {...e}
              radius={30}
              lineWidth={12}
              lineColor={lineColor}
            />
          );
        },
        body: (e) => {
          if (e.kind !== 'Default') return;
          const data = e.data as D;
          return <DevSampleNetwork key={e.index} network={data.network} />;
        },
      }}
    />
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elEmpty}
      {elClientCards}
    </div>
  );
};
