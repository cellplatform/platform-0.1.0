import React from 'react';

import { CardBody } from '../primitives';
import { CmdCard, css, CssValue, t } from './common';
import { NetworkCardBody } from './ui/Body';
import { NetworkCardChild } from './ui/Child';
import { NetworkCardTitlebar } from './ui/Titlebar';

export type NetworkCardProps = {
  instance: { network: t.PeerNetwork; id: t.Id };
  child?: JSX.Element;
  style?: CssValue;
};

export const NetworkCard: React.FC<NetworkCardProps> = (props) => {
  const { child, instance } = props;
  const { bus, netbus } = instance.network;

  const { state } = CmdCard.useController({
    instance: { bus, id: instance.id },
    initial: CmdCard.defaultState({ body: { render: () => elBody } }),
  });

  /**
   * [Render]
   */
  const styles = {
    base: css({ boxSizing: 'border-box', Flex: 'x-stretch-stretch' }),
    root: css({ minWidth: 600, minHeight: 300, display: 'flex' }),
    fill: css({ flex: 1 }),
  };

  const elHeader = <NetworkCardTitlebar instance={instance} />;

  const elBody = (
    <CardBody header={{ el: elHeader }} style={styles.fill}>
      <NetworkCardBody instance={instance} style={styles.fill} />
    </CardBody>
  );

  const elRoot = <CmdCard instance={{ bus, id: instance.id }} style={styles.root} state={state} />;
  const elChild = child && <NetworkCardChild>{child}</NetworkCardChild>;

  return (
    <div {...css(styles.base, props.style)}>
      {elRoot}
      {elChild}
    </div>
  );
};
