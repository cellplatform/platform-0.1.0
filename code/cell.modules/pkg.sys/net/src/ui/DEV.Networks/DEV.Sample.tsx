import React from 'react';

import { Label } from '../Label';
import { List, color, COLORS, css, CssValue, DevConstants, t } from './common';
import { DevEmpty } from './DEV.Empty';
import { DevNetworkCard } from './DEV.ref';

export type DevSampleProps = {
  instance: t.Id;
  networks: t.PeerNetwork[];
  view?: t.DevViewKind;
  child?: t.DevChildKind;
  style?: CssValue;
};

export const DevSample: React.FC<DevSampleProps> = (props) => {
  const { view = DevConstants.DEFAULT.VIEW, child, instance } = props;

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
    return <Label.Peer id={networks[0].self ?? ''} />;
  }

  /**
   * [Render]
   */
  const styles = {
    base: css({ boxSizing: 'border-box', minWidth: 450 }),
  };

  const elClientCards = (
    <List.Layout
      orientation={'y'}
      bullet={{ edge: 'near', size: isCollection ? 60 : 0 }}
      spacing={50}
      items={items}
      renderers={{
        bullet: (e) => {
          if (!isCollection) return null;

          const data = e.data as D;

          /**
           * TODO 🐷
           * - Get peers
           */
          const isConnected = false; // TODO 🐷
          const lineColor = isConnected ? COLORS.CYAN_BLUE : color.alpha(COLORS.DARK, 0.1);

          return (
            <List.Renderers.Bullet.ConnectorLines
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
          const network = data.network;

          return (
            <DevNetworkCard key={e.index} instance={{ id: instance, network }} child={child} />
          );
        },
      }}
    />
  );

  return (
    <div {...css(styles.base, props.style)}>
      {isEmpty && <DevEmpty plural={isCollection} />}
      {elClientCards}
    </div>
  );
};
