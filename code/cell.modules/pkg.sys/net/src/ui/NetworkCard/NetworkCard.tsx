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
  onExecuteCommand?: t.CmdCardExecuteCommandHandler;
};

export const NetworkCard: React.FC<NetworkCardProps> = (props) => {
  const { child, instance, onExecuteCommand } = props;
  const { bus, netbus } = instance.network;
  const id = instance.id;

  const card = CmdCard.useController({
    instance: { bus, id },
    initial: CmdCard.defaultState({ body: { render: () => elBody } }),
    onExecuteCommand,
  });

  const isReady = Boolean(card.state?.ready);

  /**
   * [Render]
   */
  const styles = {
    base: css({ boxSizing: 'border-box', Flex: 'x-stretch-stretch' }),
    root: css({ minWidth: 600, minHeight: 300, display: 'flex' }),
    fill: css({ flex: 1 }),
    debug: {
      busid: css({
        Absolute: [null, null, -20, 0],
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
        fontFamily: 'monospace',
      }),
    },
  };

  const elHeader = <NetworkCardTitlebar instance={instance} />;

  const elBody = (
    <CardBody header={{ el: elHeader }} style={styles.fill}>
      <NetworkCardBody instance={instance} style={styles.fill} />
    </CardBody>
  );

  const elRoot = <CmdCard instance={{ bus, id }} style={styles.root} state={card.state} />;
  const elChild = child && isReady && <NetworkCardChild>{child}</NetworkCardChild>;

  return (
    <div {...css(styles.base, props.style)}>
      {elRoot}
      {elChild}
    </div>
  );
};
