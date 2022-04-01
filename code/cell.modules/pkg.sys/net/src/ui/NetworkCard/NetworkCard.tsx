import React from 'react';

import { CardBody } from '../primitives';
import { CmdCard, css, CssValue, t } from './common';
import { NetworkCardBody } from './components/Body';
import { NetworkCardChild } from './components/Child';
import { NetworkCardTitlebar } from './components/Titlebar';

export type NetworkCardProps = {
  instance: t.Id;
  network: t.PeerNetwork;
  child?: JSX.Element;
  style?: CssValue;
};

export const NetworkCard: React.FC<NetworkCardProps> = (props) => {
  const { network, child, instance } = props;
  const { bus, netbus } = network;
  const self = netbus.self;

  const { state } = CmdCard.State.useController({
    instance: { bus, id: instance },
    bus: netbus,
    initial: CmdCard.State.default({ body: { render: () => elBody } }),
  });

  /**
   * [Render]
   */
  const styles = {
    base: css({ boxSizing: 'border-box', Flex: 'x-stretch-stretch' }),
    root: css({ minWidth: 600, minHeight: 300, display: 'flex' }),
    fill: css({ flex: 1 }),
  };

  const elHeader = <NetworkCardTitlebar bus={bus} self={self} />;

  const elBody = (
    <CardBody header={{ el: elHeader }} style={styles.fill}>
      <NetworkCardBody instance={instance} self={self} network={network} style={styles.fill} />
    </CardBody>
  );

  const elRoot = <CmdCard instance={{ bus, id: instance }} style={styles.root} state={state} />;
  const elChild = child && <NetworkCardChild>{child}</NetworkCardChild>;

  return (
    <div {...css(styles.base, props.style)}>
      {elRoot}
      {elChild}
    </div>
  );
};
