import React from 'react';

import { CardBody } from '../primitives';
import { CmdCard, css, CssValue, t } from './common';
import { NetworkCardBody } from './ui/Body';
import { NetworkCardChild } from './ui/Child';
import { NetworkCardTitlebar } from './ui/Titlebar';

export type NetworkCardProps = {
  instance: { network: t.PeerNetwork; id: t.Id };
  child?: JSX.Element;
  minimized?: boolean;
  tray?: JSX.Element;
  style?: CssValue;
  onExecuteCommand?: t.CmdCardExecuteCommandHandler;
};

export const NetworkCard: React.FC<NetworkCardProps> = (props) => {
  const { child, instance, onExecuteCommand, minimized } = props;
  const { bus } = instance.network;
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
    root: css({
      minWidth: minimized ? 450 : 600,
      minHeight: minimized ? undefined : 300,
      display: 'flex',
    }),
    fill: css({ flex: 1 }),
    child: css({ display: minimized ? 'none' : 'flex' }),
    debug: {
      busid: css({ Absolute: [null, null, -20, 0], fontFamily: 'monospace' }),
    },
  };

  const elHeader = <NetworkCardTitlebar instance={instance} />;

  const elBody = (
    <CardBody header={{ el: elHeader }} style={styles.fill}>
      <NetworkCardBody instance={instance} style={styles.fill} />
    </CardBody>
  );

  const elRoot = (
    <CmdCard
      instance={{ bus, id }}
      style={styles.root}
      state={card.state}
      minimized={minimized}
      tray={props.tray}
    />
  );
  const elChild = child && isReady && (
    <NetworkCardChild style={styles.child}>{child}</NetworkCardChild>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elRoot}
      {elChild}
    </div>
  );
};
