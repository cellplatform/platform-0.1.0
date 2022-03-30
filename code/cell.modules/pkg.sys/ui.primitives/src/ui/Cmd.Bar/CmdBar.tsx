import React, { useEffect } from 'react';

import { CmdTextbox } from '../Cmd.Textbox';
import { CmdBarEventPipe, CmdBarEventPipeProps } from './CmdBar.EventPipe';
import { color, css, CssValue, FC, t } from './common';
import { CmdBarEvents } from './Events';
import { State } from './State';

/**
 * Types
 */
export type CmdBarPart = 'Input' | 'Events';

export type CmdBarProps = {
  instance: t.CmdBarInstance;
  state?: t.CmdBarState;
  parts?: CmdBarPart[];
  cornerRadius?: [number, number, number, number];
  backgroundColor?: string | number;
  textbox?: { placeholder?: string; spinner?: boolean };
  style?: CssValue;
  onChange?: t.CmdTextboxChangeEventHandler;
  onAction?: t.CmdTextboxActionEventHandler;
};

/**
 * Constants
 */
const PARTS: CmdBarPart[] = ['Input', 'Events'];
export const CmdBarConstants = { PARTS };

/**
 * Component
 */
export const View: React.FC<CmdBarProps> = (props) => {
  const { instance, state } = props;
  const { parts = ['Input', 'Events'] } = props;

  const borderRadius = props.cornerRadius
    ?.map((value) => (value === 0 ? '0' : `${value}px`))
    .join(' ');

  const [events, setEvents] = React.useState<t.CmdBarEvents | undefined>();

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
            text={state?.text ?? ''}
            theme={'Dark'}
            placeholder={props.textbox?.placeholder}
            spinner={props.textbox?.spinner ?? state?.spinning}
            onChange={(e) => {
              const { from, to } = e;
              events?.text.changed({ from, to });
              props.onChange?.(e);
            }}
            onAction={(e) => {
              const { text } = e;
              events?.action.fire({ text });
              props.onAction?.(e);
            }}
            style={{ paddingLeft: 8 }}
          />
        </div>,
      );
    }

    if (part === 'Events') {
      appendDivider();
      elements.push(
        <div {...styles.events} key={elements.length}>
          {<CmdBarEventPipe history={state?.history} iconEdge={isFirst ? 'Left' : 'Right'} />}
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
  EventPipe: React.FC<CmdBarEventPipeProps>;
  Events: t.CmdBarEventsFactory;
  State: typeof State;
};
export const CmdBar = FC.decorate<CmdBarProps, Fields>(
  View,
  {
    EventPipe: CmdBarEventPipe,
    Events: CmdBarEvents,
    State,
  },
  { displayName: 'CmdBar' },
);
