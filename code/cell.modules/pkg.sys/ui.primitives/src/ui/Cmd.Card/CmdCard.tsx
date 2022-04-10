import React from 'react';

import { FC, t, CssValue, css, constants, useResizeObserver, Util } from './common';
import { CmdCardLayout, CmdCardLayoutProps } from './ui/Layout';
import { CmdCardEvents, CmdCardState } from './logic';
import { CmdStateInfo } from './ui/Info';

import { Card } from '../Card';

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
  const resize = useResizeObserver();

  /**
   * [Render]
   */
  const radius = showAsCard ? 4 : 0;
  const styles = {
    base: css({
      display: 'flex',
      visibility: resize.ready ? 'visible' : 'hidden',
    }),
    layout: css({ flex: 1 }),
  };

  return (
    <Card
      ref={resize.ref}
      showAsCard={showAsCard}
      style={css(styles.base, props.style)}
      border={{ radius }}
    >
      <CmdCardLayout
        instance={instance}
        state={state}
        style={styles.layout}
        borderRadius={radius - 1}
        resize={resize}
      />
    </Card>
  );
};

/**
 * Export
 */
type Fields = {
  constants: typeof constants;
  Layout: React.FC<CmdCardLayoutProps>;
  Events: typeof CmdCardEvents;
  State: typeof CmdCardState;
  Info: typeof CmdStateInfo;
};
export const CmdCard = FC.decorate<CmdCardProps, Fields>(
  View,
  {
    constants,
    Layout: CmdCardLayout,
    Events: CmdCardEvents,
    State: CmdCardState,
    Info: CmdStateInfo,
  },
  { displayName: 'CmdCard' },
);
