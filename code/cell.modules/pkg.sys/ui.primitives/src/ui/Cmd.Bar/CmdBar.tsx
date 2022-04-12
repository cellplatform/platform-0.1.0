import React, { useEffect, useRef } from 'react';

import { CmdTextbox, CmdTextboxProps } from '../Cmd.Textbox';
import { CmdBarEventPipe } from './ui/EventPipe';
import { color, css, CssValue, FC, t } from './common';
import { CmdBarEvents, CmdBarController } from './logic';

/**
 * Types
 */
export type CmdBarPart = 'Input' | 'Events';

export type CmdBarProps = {
  instance: t.CmdBarInstance;
  parts?: CmdBarPart[];
  cornerRadius?: [number, number, number, number];
  backgroundColor?: string | number;
  text?: string;
  textbox?: { placeholder?: string; spinning?: boolean; pending?: boolean };
  style?: CssValue;
  onChange?: t.CmdTextboxChangeEventHandler;
  onAction?: t.CmdTextboxActionEventHandler;
};

/**
 * Constants
 */
const PARTS: CmdBarPart[] = ['Input', 'Events'];
const constants = { PARTS };

/**
 * Component
 */
const View: React.FC<CmdBarProps> = (props) => {
  const { instance } = props;
  const { parts = ['Input', 'Events'] } = props;

  const borderRadius = props.cornerRadius
    ?.map((value) => (value === 0 ? '0' : `${value}px`))
    .join(' ');

  const [events, setEvents] = React.useState<t.CmdBarEventsDisposable | undefined>();

  /**
   * Lifecycle
   */
  useEffect(() => {
    if (instance) setEvents(CmdBarEvents({ instance }));
    return () => events?.dispose();
  }, [instance]); // eslint-disable-line

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
    input: css({ flex: 2, paddingTop: 10, paddingBottom: 4 }),
    events: css({
      flex: 1,
      display: 'flex',
      overflow: 'hidden',
      position: 'relative',
      paddingRight: 10,
    }),
    divider: {
      spacer: css({ width: 10 }),
      border: css({
        borderLeft: `solid 1px ${color.format(-0.2)}`,
        borderRight: `solid 1px ${color.format(0.1)}`,
      }),
    },
  };

  const elements: JSX.Element[] = [];

  const appendDivider = () => {
    if (elements.length > 0) {
      elements.push(<div {...styles.divider.spacer} key={elements.length} />);
      elements.push(<div {...styles.divider.border} key={elements.length} />);
      elements.push(<div {...styles.divider.spacer} key={elements.length} />);
    }
  };

  parts.forEach((part, i) => {
    const isFirst = i === 0;

    if (part === 'Input') {
      appendDivider();
      elements.push(
        <div {...styles.input} key={elements.length}>
          <CmdTextbox
            theme={'Dark'}
            text={props.text ?? ''}
            placeholder={props.textbox?.placeholder}
            spinner={props.textbox?.spinning}
            pending={props.textbox?.pending}
            style={{ paddingLeft: 8 }}
            onChange={(e) => {
              const { from, to } = e;
              props.onChange?.(e);
              events?.text.change({ from, to });
            }}
            onAction={(e) => {
              const { kind, text } = e;
              props.onAction?.(e);
              events?.action.fire({ kind, text });
            }}
          />
        </div>,
      );
    }

    if (part === 'Events') {
      appendDivider();
      elements.push(
        <div {...styles.events} key={elements.length}>
          {<CmdBarEventPipe history={[]} iconEdge={isFirst ? 'Left' : 'Right'} />}
        </div>,
      );
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
