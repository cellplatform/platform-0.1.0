import React from 'react';

import { time, color, css, FC } from './common';
import { CmdBarEvents, CmdBarController } from './logic';
import { TrayPlaceholder } from './ui/Tray.Placeholder';
import { Event } from '../Event';
import { CmdBarProps } from './types';
import { Textbox } from './ui/Textbox';
import { TrayIcons } from './ui/Tray.Icons';

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
    inset: css({ Absolute: 0 }),
    body: css({ flex: 1, Flex: 'x-stretch-stretch' }),
    input: css({
      flex: props.textbox?.flex ?? 1,
      paddingTop: 10,
      paddingBottom: 4,
    }),
    divider: {
      border: css({
        borderLeft: `solid 1px ${color.format(-0.2)}`,
        borderRight: `solid 1px ${color.format(0.1)}`,
      }),
    },
  };

  return (
    <div {...css(styles.base, props.style)} onMouseDown={() => time.delay(0, events.text.focus)}>
      <div {...styles.body}>
        <div {...styles.input}>
          <Textbox {...props} events={events} />
        </div>
        {props.tray && <div {...styles.divider.border} />}
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
  Tray: {
    Placeholder: typeof TrayPlaceholder;
    Icons: typeof TrayIcons;
  };
};
export const CmdBar = FC.decorate<CmdBarProps, Fields>(
  View,
  {
    Events: CmdBarEvents,
    Controller: CmdBarController,
    Tray: {
      Placeholder: TrayPlaceholder,
      Icons: TrayIcons,
    },
  },
  { displayName: 'Cmd.Bar' },
);
