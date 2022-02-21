import React from 'react';

import { color, css, CssValue, FC, t } from '../../common';
import {
  CommandTextbox,
  CommandTextboxActionEventHandler,
  CommandTextboxChangeEventHandler,
} from '../Command.Textbox';
import { CommandBarEventPipe, CommandBarEventPipeProps } from './CommandBar.EventPipe';
import { CommandBarInset, CommandBarInsetProps } from './CommandBar.Inset';
import { CommandBarEvents } from './Events';
import * as k from './types';

/**
 * Types
 */
export type CommandBarPart = 'Input' | 'Events';

export type CommandBarProps = {
  events?: { bus: t.EventBus<any>; instance: string };
  netbus: t.NetworkBus<any>;
  inset?: boolean | CommandBarInsetProps;
  parts?: CommandBarPart[];
  cornerRadius?: [number, number, number, number];
  backgroundColor?: string | number;
  style?: CssValue;
  onChange?: CommandTextboxChangeEventHandler;
  onAction?: CommandTextboxActionEventHandler;
};

/**
 * Constants
 */
const PARTS: CommandBarPart[] = ['Input', 'Events'];
export const CommandBarConstants = { PARTS };

/**
 * Component
 */
export const View: React.FC<CommandBarProps> = (props) => {
  const { netbus, inset } = props;
  const { parts = ['Input', 'Events'] } = props;

  const borderRadius = props.cornerRadius
    ?.map((value) => (value === 0 ? '0' : `${value}px`))
    .join(' ');

  const [events, setEvents] = React.useState<k.CommandBarEvents | undefined>();

  /**
   * Lifecycle
   */
  React.useEffect(() => {
    if (props.events) setEvents(CommandBarEvents(props.events));
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
          <CommandTextbox
            theme={'Dark'}
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
          {<CommandBarEventPipe netbus={netbus} iconEdge={isFirst ? 'Left' : 'Right'} />}
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

  const elInsetBorder = inset && <CommandBarInset {...insetProps} style={styles.inset} />;

  return (
    <div {...css(styles.base, props.style)}>
      {elInsetBorder}
      {elBody}
    </div>
  );
};

type Fields = {
  Inset: React.FC<CommandBarInsetProps>;
  EventPipe: React.FC<CommandBarEventPipeProps>;
  Events: k.CommandBarEventsFactory;
};
export const CommandBar = FC.decorate<CommandBarProps, Fields>(View, {
  Inset: CommandBarInset,
  EventPipe: CommandBarEventPipe,
  Events: CommandBarEvents,
});
