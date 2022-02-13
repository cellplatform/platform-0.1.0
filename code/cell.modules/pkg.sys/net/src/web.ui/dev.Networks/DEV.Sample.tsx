import React from 'react';

import { Label } from '../Label';
import { NetbusCard } from '../NetbusCard';
import {
  BulletList,
  color,
  COLORS,
  css,
  CssValue,
  DevConstants,
  NetworkCard,
  t,
} from './DEV.common';
import { DevCrdtCard } from './DEV.CrdtCard';
import { DevEmpty } from './DEV.Empty';
import { DevFsCard } from './DEV.FsCard';

export type DevSampleProps = {
  networks: t.PeerNetwork[];
  view?: t.DevViewKind;
  child?: t.DevChildKind;
  style?: CssValue;
};

export const DevSample: React.FC<DevSampleProps> = (props) => {
  const { view = DevConstants.DEFAULT.VIEW, child } = props;

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
  };

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
          const { network } = data;
          const { netbus } = network;

          const style = css({ flex: 1 });
          let elChild: undefined | JSX.Element;

          if (child === 'Netbus') elChild = <NetbusCard netbus={netbus} style={style} />;
          if (child === 'Crdt') elChild = <DevCrdtCard network={network} style={style} />;
          if (child === 'Filesystem') elChild = <DevFsCard network={network} style={style} />;

          return <NetworkCard key={e.index} network={network} child={elChild} />;
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
