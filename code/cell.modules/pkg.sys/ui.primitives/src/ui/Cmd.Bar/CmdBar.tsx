import React from 'react';

import { color, css, CssValue, FC, t } from './common';
import { CmdTextbox } from '../Cmd.Textbox';
import { CmdBarEventPipe, CmdBarEventPipeProps } from './CmdBar.EventPipe';
import { CmdBarInset, CmdBarInsetProps } from './CmdBar.Inset';
import { CmdBarEvents } from './Events';
import * as k from './types';

type Id = string;

/**
 * Types
 */
export type CmdBarPart = 'Input' | 'Events';

export type CmdBarProps = {
  events?: { bus: t.EventBus<any>; instance: Id };
  bus: t.EventBus<any>;
  inset?: boolean | CmdBarInsetProps;
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
  const { bus, inset } = props;
  const { parts = ['Input', 'Events'] } = props;

  const borderRadius = props.cornerRadius
    ?.map((value) => (value === 0 ? '0' : `${value}px`))
    .join(' ');

  const [events, setEvents] = React.useState<k.CmdBarEvents | undefined>();

  /**
   * Lifecycle
   */
  React.useEffect(() => {
    if (props.events) setEvents(CmdBarEvents(props.events));
    return () => events?.dispose();
  }, [props.events]); // eslint-disable-line

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
    events: css({ flex: 1, display: 'flex' }),
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
            placeholder={props.textbox?.placeholder}
            spinner={props.textbox?.spinner}
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
          />
        </div>,
      );
    }

    if (part === 'Events') {
      appendDivider();
      elements.push(
        <div {...styles.events} key={elements.length}>
          {<CmdBarEventPipe bus={bus} iconEdge={isFirst ? 'Left' : 'Right'} />}
        </div>,
      );
    }
  });

  const elBody = (
    <div {...styles.body}>
      <div {...styles.divider.spacer} />
      {elements}
      <div {...styles.divider.spacer} />
    </div>
  );

  const insetProps = {
    cornerRadius: props.cornerRadius,
    ...(typeof inset === 'object' ? inset : {}),
  };

  const elInsetBorder = inset && <CmdBarInset {...insetProps} style={styles.inset} />;

  return (
    <div {...css(styles.base, props.style)}>
      {elInsetBorder}
      {elBody}
    </div>
  );
};

/**
 * Export
 */
type Fields = {
  Inset: React.FC<CmdBarInsetProps>;
  EventPipe: React.FC<CmdBarEventPipeProps>;
  Events: k.CmdBarEventsFactory;
};
export const CmdBar = FC.decorate<CmdBarProps, Fields>(
  View,
  {
    Inset: CmdBarInset,
    EventPipe: CmdBarEventPipe,
    Events: CmdBarEvents,
  },
  { displayName: 'CmdBar' },
);
