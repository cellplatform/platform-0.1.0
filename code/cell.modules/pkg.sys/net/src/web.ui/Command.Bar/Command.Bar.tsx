import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { color, css, CssValue, EventPipe, FC, t, useEventBusHistory } from '../../common';
import {
  CommandTextbox,
  CommandTextboxActionEventHandler,
  CommandTextboxChangeEventHandler,
} from '../Command.Textbox';
import { Icons } from '../Icons';
import { CommandInset, CommandInsetProps } from './Command.Inset';
import { CommandBarEvents, CommandBarEventsProps } from './CommandBar.Events';

/**
 * Types
 */
export type CommandBarPart = 'Input' | 'Events';

export type CommandBarProps = {
  network: t.PeerNetwork;
  inset?: boolean | CommandInsetProps;
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
  const { network, inset } = props;
  const { parts = ['Input', 'Events'] } = props;

  const borderRadius = props.cornerRadius
    ?.map((value) => (value === 0 ? '0' : `${value}px`))
    .join(' ');

  /**
   * [Render]
   */
  const styles = {
    base: css({
      display: 'flex',
      position: 'relative',
      boxSizing: 'border-box',
      borderRadius,
      backgroundColor: color.format(props.backgroundColor),
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

  const elDivBorder = <div {...styles.divider.border} />;
  const elDivSpacer = <div {...styles.divider.spacer} />;
  const appendDivider = () => {
    if (elements.length > 0) elements.push(...[elDivSpacer, elDivBorder, elDivSpacer]);
  };

  parts.forEach((part) => {
    if (part === 'Input') {
      appendDivider();
      elements.push(
        <div {...styles.input}>
          <CommandTextbox onChange={props.onChange} onAction={props.onAction} theme={'Dark'} />
        </div>,
      );
    }

    if (part === 'Events') {
      appendDivider();
      elements.push(<div {...styles.events}>{<CommandBarEvents network={network} />}</div>);
    }
  });

  const elBody = (
    <div {...styles.body}>
      {elDivSpacer}
      {elements}
      {elDivSpacer}
    </div>
  );

  const insetProps = {
    cornerRadius: props.cornerRadius,
    ...(typeof inset === 'object' ? inset : {}),
  };

  const elInsetBorder = inset && <CommandInset {...insetProps} style={styles.inset} />;

  return (
    <div {...css(styles.base, props.style)}>
      {elInsetBorder}
      {elBody}
    </div>
  );
};

type Fields = {
  Inset: React.FC<CommandInsetProps>;
  Events: React.FC<CommandBarEventsProps>;
};
export const CommandBar = FC.decorate<CommandBarProps, Fields>(View, {
  Inset: CommandInset,
  Events: CommandBarEvents,
});
