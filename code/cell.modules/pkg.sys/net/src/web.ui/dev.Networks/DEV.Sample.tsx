import React from 'react';

import { BulletList, css, CssValue, t } from './DEV.common';
import { DevSampleNetwork } from './DEV.Sample.Network';

type D = { network: t.PeerNetwork };

export type DevSampleProps = {
  networks: t.PeerNetwork[];
  style?: CssValue;
};

export const DevSample: React.FC<DevSampleProps> = (props) => {
  const { networks = [] } = props;

  const isEmpty = networks.length === 0;
  const items = networks.map((network) => ({ data: { network } }));

  /**
   * [Render]
   */
  const styles = {
    base: css({ minWidth: 450 }),
    empty: css({
      padding: 50,
      Flex: 'center-center',
      fontSize: 12,
      fontStyle: 'italic',
      opacity: 0.3,
    }),
  };

  const elEmpty = isEmpty && <div {...styles.empty}>No networks to display</div>;

  const elCards = (
    <BulletList.Layout
      orientation={'y'}
      bullet={{ edge: 'near', size: 60 }}
      spacing={20}
      items={items}
      renderers={{
        bullet: (e) => {
          return <BulletList.Renderers.Bullet.ConnectorLines {...e} radius={25} />;
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
      {elCards}
    </div>
  );
};
