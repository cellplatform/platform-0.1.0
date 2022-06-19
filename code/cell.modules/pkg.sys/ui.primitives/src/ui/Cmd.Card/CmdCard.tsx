import React from 'react';

import { Card } from '../Card';
import { CmdBar, css, DEFAULT, FC, Util } from './common';
import { CmdCardController, CmdCardEvents, useCmdCardController } from './logic';
import { CmdCardProps } from './types';
import { CmdStateInfo } from './view/Info';
import { CmdCardLayout, CmdCardLayoutProps } from './view/Layout';

/**
 * Types
 */
export { CmdCardProps };

/**
 * Component
 */
const View: React.FC<CmdCardProps> = (props) => {
  const { instance, showAsCard = true } = props;

  /**
   * [Render]
   */
  const radius = showAsCard ? 4 : 0;
  const styles = {
    base: css({ display: 'flex' }),
    layout: css({ flex: 1 }),
  };

  return (
    <Card showAsCard={showAsCard} border={{ radius }} style={css(styles.base, props.style)}>
      <CmdCardLayout
        instance={instance}
        commandbar={props.commandbar}
        style={styles.layout}
        borderRadius={radius - 1}
        tray={props.tray}
        body={props.body}
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
