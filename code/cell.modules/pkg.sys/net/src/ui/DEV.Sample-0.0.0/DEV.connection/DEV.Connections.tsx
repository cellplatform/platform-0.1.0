import React from 'react';

import { Card, CardStack, CardStackItem, css, CssValue, t } from '../DEV.common';
import { DevCard } from '../DEV.layouts';

export type DevConnectionsProps = {
  children?: React.ReactNode;
  bus: t.EventBus<any>;
  connections: t.PeerConnectionStatus[];
  margin?: t.CssEdgesInput;
  style?: CssValue;
  onDrop?: (e: t.Dropped) => void;
};

export const DevConnections: React.FC<DevConnectionsProps> = (props) => {
  const { bus, connections } = props;
  const styles = { base: css({}) };

  const handleClose = () => {
    connections.forEach((connection) => {
      const { self, remote } = connection.peer;
      bus.fire({
        type: 'sys.net/peer/conn/disconnect:req',
        payload: { self, remote, connection: connection.id },
      });
    });
  };

  const stack: CardStackItem[] = connections.map((item) => {
    return {
      id: item.id,
      el(e) {
        if (!e.is.top) return <Card margin={props.margin} width={300} shadow={false} />;
        return (
          <DevCard margin={props.margin} onClose={handleClose} onDrop={props.onDrop}>
            {props.children}
          </DevCard>
        );
      },
    };
  });

  return (
    <div {...css(styles.base, props.style)}>
      <CardStack items={stack} maxDepth={3} />
    </div>
  );
};
