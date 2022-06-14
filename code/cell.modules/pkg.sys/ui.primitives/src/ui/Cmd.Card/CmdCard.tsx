import React from 'react';

import { FC, t, CssValue, css, DEFAULT, useResizeObserver, Util, CmdBar } from './common';
import { CmdCardLayout, CmdCardLayoutProps } from './ui/Layout';
import { CmdCardEvents, CmdCardController, useCmdCardController } from './logic';
import { CmdStateInfo } from './ui/Info';

import { Card } from '../Card';
import { CmdCardProps } from './types';

/**
 * Types
 */
export { CmdCardProps };

/**
 * Component
 */
const View: React.FC<CmdCardProps> = (props) => {
  const { instance, showAsCard = true } = props;
  const state = props.state ?? Util.state.default();
  const resize = useResizeObserver();

  /**
   * [Render]
   */
  const radius = showAsCard ? 4 : 0;
  const styles = {
    base: css({
      visibility: resize.ready ? 'visible' : 'hidden',
      display: 'flex',
    }),
    layout: css({ flex: 1 }),
  };

  return (
    <Card
      ref={resize.ref}
      showAsCard={showAsCard}
      border={{ radius }}
      style={css(styles.base, props.style)}
    >
      <CmdCardLayout
        instance={instance}
        state={state}
        style={styles.layout}
        borderRadius={radius - 1}
        resize={resize}
        tray={props.tray}
        minimized={props.minimized}
      />
    </Card>
  );
};

/**
 * Export
 */
type Fields = {
  DEFAULT: typeof DEFAULT;
  Info: typeof CmdStateInfo;
  Layout: React.FC<CmdCardLayoutProps>;
  Tray: typeof CmdBar.Tray;
  Events: typeof CmdCardEvents;
  Controller: typeof CmdCardController;
  useController: typeof useCmdCardController;
  defaultState: typeof Util.state.default;
};
export const CmdCard = FC.decorate<CmdCardProps, Fields>(
  View,
  {
    DEFAULT,
    Info: CmdStateInfo,
    Layout: CmdCardLayout,
    Tray: CmdBar.Tray,
    Events: CmdCardEvents,
    Controller: CmdCardController,
    useController: useCmdCardController,
    defaultState: Util.state.default,
  },
  { displayName: 'Cmd.Card' },
);
