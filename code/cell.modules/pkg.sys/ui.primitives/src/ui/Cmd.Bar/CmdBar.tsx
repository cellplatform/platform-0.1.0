import React from 'react';

import { time, color, css, FC, t, PARTS } from './common';
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
      flex: props.textbox?.flex ?? 1,
      paddingTop: 10,
      paddingBottom: 4,
    }),
    tray: css({
      flex: props.tray?.flex,
      position: 'relative',
      display: 'flex',
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
      const args = { instance, is };
      let el = props.tray?.render?.(args);
      if (el === undefined) el = CmdBar.Tray.Default.render(args); // NB: Null response means "no tray"
      if (el) {
        appendDivider();
        append((e) => (
          <div {...styles.tray} key={e.key}>
            {el}
          </div>
        ));
      }
    }
  });

  return (
    <div {...css(styles.base, props.style)} onMouseDown={() => time.delay(0, events.text.focus)}>
      <div {...styles.body}>{elements}</div>
    </div>
  );
};

/**
 * Export
 */
type Fields = {
  PARTS: typeof PARTS;
  Events: typeof CmdBarEvents;
  Controller: typeof CmdBarController;
  Tray: { Default: typeof TrayPlaceholder; Icons: typeof TrayIcons };
};
export const CmdBar = FC.decorate<CmdBarProps, Fields>(
  View,
  {
    PARTS,
    Events: CmdBarEvents,
    Controller: CmdBarController,
    Tray: {
      Default: TrayPlaceholder,
      Icons: TrayIcons,
    },
  },
  { displayName: 'CmdBar' },
);
