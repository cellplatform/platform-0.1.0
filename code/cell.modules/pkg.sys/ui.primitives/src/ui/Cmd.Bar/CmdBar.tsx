import React from 'react';

import { Event } from '../Event';
import { color, css, FC, time } from './common';
import { CmdBarController, CmdBarEvents, useCmdBarController } from './logic';
import { CmdBarProps } from './types';
import { CmdBarGrammerInfo } from './view/Info.Grammer';
import { Textbox } from './view/Textbox';
import { TrayIcons } from './view/Tray.Icons';
import { TrayPlaceholder } from './view/Tray.Placeholder';

export { CmdBarProps };

/**
 * Component
 */
const View: React.FC<CmdBarProps> = (props) => {
  const { instance } = props;

  const borderRadius = props.cornerRadius
    ?.map((value) => (value === 0 ? '0' : `${value}px`))
    .join(' ');

  const events = Event.useEventsRef(() => CmdBarEvents({ instance }));

  /**
   * [Render]
   */
  const styles = {
    base: css({
      display: 'flex',
      position: 'relative',
      boxSizing: 'border-box',
      backgroundColor: color.format(props.backgroundColor),
      borderRadius,
    }),
    body: css({ flex: 1, Flex: 'x-stretch-stretch' }),
    input: css({ flex: 1, Flex: 'x-center-stretch' }),
    divider: css({
      borderLeft: `solid 1px ${color.format(-0.2)}`,
      borderRight: `solid 1px ${color.format(0.1)}`,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>
        <div {...styles.input} onMouseDown={() => time.delay(0, events.textbox.focus)}>
          <Textbox {...props} events={events} />
        </div>
        {props.tray && <div {...styles.divider} />}
        {props.tray}
      </div>
    </div>
  );
};

/**
 * Export
 */
type Fields = {
  Events: typeof CmdBarEvents;
  Controller: typeof CmdBarController;
  useController: typeof useCmdBarController;
  Tray: {
    Placeholder: typeof TrayPlaceholder;
    Icons: typeof TrayIcons;
  };
  Grammer: {
    Info: typeof CmdBarGrammerInfo;
  };
};
export const CmdBar = FC.decorate<CmdBarProps, Fields>(
  View,
  {
    Events: CmdBarEvents,
    Controller: CmdBarController,
    useController: useCmdBarController,
    Tray: {
      Placeholder: TrayPlaceholder,
      Icons: TrayIcons,
    },
    Grammer: {
      Info: CmdBarGrammerInfo,
    },
  },
  { displayName: 'Cmd.Bar' },
);
