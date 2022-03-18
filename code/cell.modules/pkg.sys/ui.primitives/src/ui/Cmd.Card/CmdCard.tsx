import React from 'react';

import { CssValue, t, FC } from './common';
import { CmdCardLayout as Layout, CmdCardLayoutProps } from './CmdCard.Layout';
import { CmdCardEvents as Events } from './Events';

/**
 * Types
 */
export type CmdCardProps = {
  bus: t.EventBus<any>;
  style?: CssValue;
};

/**
 * Component
 */
const View: React.FC<CmdCardProps> = (props) => {
  const { bus } = props;
  return <Layout bus={bus} style={props.style} />;
};

/**
 * Export
 */
type Fields = {
  Layout: React.FC<CmdCardLayoutProps>;
  Events: t.CmdCardEventsFactory;
};
export const CmdCard = FC.decorate<CmdCardProps, Fields>(
  View,
  { Layout, Events },
  { displayName: 'CmdCard' },
);
