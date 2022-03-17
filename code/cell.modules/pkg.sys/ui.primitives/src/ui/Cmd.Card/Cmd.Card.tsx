import React from 'react';

import { css, CssValue, t, FC } from './common';
import {
  CmdCardLayout as Layout,
  CmdCardLayoutProps as CmdCardLayoutProps,
} from './Cmd.Card.Layout';

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
};
export const CmdCard = FC.decorate<CmdCardProps, Fields>(
  View,
  { Layout },
  { displayName: 'CmdCard' },
);
