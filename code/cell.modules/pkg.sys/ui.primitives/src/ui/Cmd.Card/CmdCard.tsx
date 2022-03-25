import React from 'react';

import { CardProps } from '../Card';
import { FC, t } from './common';
import { CmdCardLayout as Layout, CmdCardLayoutProps } from './components/Layout';
import { CmdCardEvents as Events } from './Events';

/**
 * Types
 */
export type CmdCardProps = CmdCardLayoutProps & { withinCard?: boolean };

/**
 * Component
 */
const View: React.FC<CmdCardProps> = (props) => {
  const { withinCard = true } = props;

  const cardProps: CardProps = typeof withinCard === 'object' ? withinCard : {};

  /**
   * TODO 🐷
   * show wihtin card when required
   */
  console.group('🐷 TODO');
  console.log('withinCard', withinCard);
  console.log('cardProps', cardProps);
  console.groupEnd();

  const elLayout = <Layout {...props} />;
  return elLayout;
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
