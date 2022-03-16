import React from 'react';

import { css, CssValue, t, FC } from './common';
import { CommandCardLayout as Layout, CommandCardLayoutProps } from './Command.Card.Layout';

/**
 * Types
 */
export type CommandCardProps = {
  bus: t.EventBus<any>;
  style?: CssValue;
};

/**
 * Component
 */
const View: React.FC<CommandCardProps> = (props) => {
  const { bus } = props;
  return <Layout bus={bus} style={props.style} />;
};

/**
 * Export
 */
type Fields = {
  Layout: React.FC<CommandCardLayoutProps>;
};
export const CommandCard = FC.decorate<CommandCardProps, Fields>(
  View,
  { Layout },
  { displayName: 'CommandCard' },
);
