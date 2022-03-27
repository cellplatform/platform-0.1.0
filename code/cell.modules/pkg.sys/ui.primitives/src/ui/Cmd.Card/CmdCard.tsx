import React from 'react';

import { FC, t, CssValue, css } from './common';
import { CmdCardLayout as Layout, CmdCardLayoutProps } from './components/Layout';
import { CmdCardEvents as Events } from './Events';
import { useStateController } from './useStateController';
import { State, CmdCardState } from './State';
import { Card } from '../Card';

/**
 * Types
 */
export type CmdCardProps = {
  event: t.CmdCardBusArgs;
  useState?: true | t.CmdCardState;
  showAsCard?: boolean;
  style?: CssValue;
};

/**
 * Component
 */
const View: React.FC<CmdCardProps> = (props) => {
  const { event, showAsCard = true } = props;

  const controller = useStateController({
    event,
    enabled: props.useState !== undefined,
    state: typeof props.useState === 'object' ? props.useState : undefined,
  });

  const { state } = controller;

  /**
   * [Redner]
   */
  const borderRadius = showAsCard ? 4 : 0;
  const styles = {
    base: css({ display: 'flex' }),
    layout: css({ flex: 1 }),
  };

  return (
    <Card
      showAsCard={showAsCard}
      style={css(styles.base, props.style)}
      border={{ radius: borderRadius }}
    >
      <Layout
        event={event}
        bus={state.bus}
        isOpen={state.isOpen}
        style={styles.layout}
        borderRadius={borderRadius - 1}
      />
    </Card>
  );
};

/**
 * Export
 */
type Fields = {
  Layout: React.FC<CmdCardLayoutProps>;
  Events: t.CmdCardEventsFactory;
  State: CmdCardState;
};
export const CmdCard = FC.decorate<CmdCardProps, Fields>(
  View,
  { Layout, Events, State },
  { displayName: 'CmdCard' },
);
