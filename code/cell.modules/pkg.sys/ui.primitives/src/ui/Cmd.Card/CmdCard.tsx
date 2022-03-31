import React from 'react';

import { FC, t, CssValue, css } from './common';
import { CmdCardLayout as Layout, CmdCardLayoutProps } from './components/Layout';
import { CmdCardEvents as Events } from './Events';
import { CmdStateInfo } from './components/Info';

import { State } from './State';
import { Card } from '../Card';
import { Util } from './Util';

/**
 * Types
 */
export type CmdCardProps = {
  instance: t.CmdCardInstance;
  state?: t.CmdCardState;
  showAsCard?: boolean;
  style?: CssValue;
};

/**
 * Component
 */
const View: React.FC<CmdCardProps> = (props) => {
  const { instance, showAsCard = true } = props;
  const state = props.state ?? Util.defaultState();

  /**
   * [Render]
   */
  const radius = showAsCard ? 4 : 0;
  const styles = {
    base: css({ display: 'flex' }),
    layout: css({ flex: 1 }),
  };

  return (
    <Card showAsCard={showAsCard} style={css(styles.base, props.style)} border={{ radius }}>
      <Layout instance={instance} state={state} style={styles.layout} borderRadius={radius - 1} />
    </Card>
  );
};

/**
 * Export
 */
type Fields = {
  Layout: React.FC<CmdCardLayoutProps>;
  Events: t.CmdCardEventsFactory;
  State: typeof State;
  Info: typeof CmdStateInfo;
};
export const CmdCard = FC.decorate<CmdCardProps, Fields>(
  View,
  { Layout, Events, State, Info: CmdStateInfo },
  { displayName: 'CmdCard' },
);
