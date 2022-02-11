import React from 'react';

import { color, BulletList, css, CssValue, t, COLORS, Icons, Text } from './DEV.common';
import { DevNetwork, DevNetworkView, DevNetworkConstants } from './DEV.Network';
import { Label } from '../Label';

export type DevSampleProps = {
  networks: t.PeerNetwork[];
  view?: DevNetworkView;
  style?: CssValue;
};

export const DevSample: React.FC<DevSampleProps> = (props) => {
  console.log('props', props);
  const { view = DevNetworkConstants.DEFAULT.VIEW } = props;

  const isCollection = view === 'Collection';
  const list = props.networks ?? [];
  const networks = view === 'Collection' ? list : list.slice(0, 1);

  type D = { network: t.PeerNetwork };
  const isEmpty = networks.length === 0;
  const items = networks.map<{ data: D }>((network) => ({ data: { network } }));

  if (view === 'URI') {
    /**
     * TODO 🐷
     */
    return <Label.Network id={''} />;
  }

  /**
   * [Render]
   */
  const styles = {
    base: css({
      boxSizing: 'border-box',
      minWidth: 450,
    }),
    empty: {
      base: css({ minWidth: 660, Flex: 'center-center' }),
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
      bullet={{ edge: 'near', size: isCollection ? 60 : 0 }}
      spacing={50}
      items={items}
      renderers={{
        bullet: (e) => {
          if (!isCollection) return null;

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
          return <DevNetwork key={e.index} network={data.network} />;
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
