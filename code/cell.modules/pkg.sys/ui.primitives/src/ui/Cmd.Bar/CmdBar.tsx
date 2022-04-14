import React from 'react';

import { color, css, FC, t, PARTS } from './common';
import { CmdBarEvents, CmdBarController } from './logic';
import { TrayPlaceholder } from './ui/Tray.Placeholder';
import { Event } from '../Event';
import { CmdBarProps } from './types';
import { Textbox } from './ui/Textbox';

export { CmdBarProps };

/**
 * Types
 */

/**
 * Constants
 */
const constants = { PARTS };

/**
 * Component
 */
const View: React.FC<CmdBarProps> = (props) => {
  const { instance } = props;
  const { show = PARTS } = props;

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
      flex: props.textbox?.flex ?? 2,
      paddingTop: 10,
      paddingBottom: 4,
    }),
    tray: css({
      flex: props.tray?.flex ?? 1,
      display: 'flex',
      position: 'relative',
    }),
    divider: {
      border: css({
        borderLeft: `solid 1px ${color.format(-0.2)}`,
        borderRight: `solid 1px ${color.format(0.1)}`,
      }),
    },
  };

  const elements: JSX.Element[] = [];
  const append = (fn: (e: { key: string }) => JSX.Element) => {
    const key = `item-${elements.length}`;
    elements.push(fn({ key }));
  };

  const appendDivider = () => {
    if (elements.length > 0) {
      append((e) => <div {...styles.divider.border} key={e.key} />);
    }
  };

  show.forEach((part, i) => {
    const is: t.CmdBarRenderPartFlags = {
      first: i === 0,
      last: i === show.length - 1,
      only: show.length === 1,
    };

    if (part === 'Input') {
      appendDivider();
      append((e) => (
        <div {...styles.input} key={e.key}>
          <Textbox {...props} events={events} is={is} />
        </div>
      ));
    }

    if (part === 'Tray') {
      const render = props.tray?.render ?? TrayPlaceholder.render;
      appendDivider();
      append((e) => (
        <div {...styles.tray} key={e.key}>
          {render({ instance, is })}
        </div>
      ));
    }
  });

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>{elements}</div>
    </div>
  );
};

/**
 * Export
 */
type Fields = {
  constants: typeof constants;
  Events: typeof CmdBarEvents;
  Controller: typeof CmdBarController;
};
export const CmdBar = FC.decorate<CmdBarProps, Fields>(
  View,
  {
    constants,
    Events: CmdBarEvents,
    Controller: CmdBarController,
  },
  { displayName: 'CmdBar' },
);
