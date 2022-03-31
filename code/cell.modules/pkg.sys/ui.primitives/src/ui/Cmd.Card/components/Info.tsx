import React, { useEffect, useRef, useState } from 'react';

import { PropList } from '../../PropList';
import { css, CssValue, FC, t } from '../common';

import * as k from '../types';

/**
 * Types
 */
export type CmdCardInfoProps = {
  state: CmdCardInfoState;
  fields?: k.CmdCardStateInfoFields[];
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  style?: CssValue;
  onStateControllerToggle?: (e: { from: boolean; to: boolean }) => void;
};
export type CmdCardInfoState = {
  title?: string;
  isControllerEnabled?: boolean;
};

/**
 * Constants
 */
const ALL_FIELDS: t.CmdCardStateInfoFields[] = ['Title', 'State', 'State.Controller', 'Version'];
const DEFAULT_FIELDS: t.CmdCardStateInfoFields[] = [
  'Title',
  'State',
  'State.Controller',
  'Version',
];
const DEFAULT = {
  title: 'CommandCard Info',
  fields: {
    all: ALL_FIELDS,
    default: DEFAULT_FIELDS,
  },
};

/**
 * Component
 */
export const View: React.FC<CmdCardInfoProps> = (props) => {
  const { width, minWidth = 230, maxWidth, fields = DEFAULT_FIELDS, state } = props;

  const title = fields.includes('Title') ? state.title ?? DEFAULT.title : undefined;
  const items = PropList.builder<k.CmdCardStateInfoFields>()
    .field('State', {
      label: 'State',
      value: { data: '{FOO}', monospace: true },
    })
    .field('State.Controller', {
      label: 'State.Controller',
      value: {
        data: state.isControllerEnabled,
        kind: 'Switch',
        onClick(e) {
          const from = Boolean(state.isControllerEnabled);
          const to = !from;
          props.onStateControllerToggle?.({ from, to });
        },
      },
    })
    .field('Version', {
      label: 'Version',
      value: { data: '{FOO}', monospace: true },
    })
    .items(fields);

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative', width, minWidth, maxWidth }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <PropList title={title} items={items} defaults={{ clipboard: false }} />
    </div>
  );
};

type Fields = {
  fields: typeof DEFAULT.fields;
};
export const CmdStateInfo = FC.decorate<CmdCardInfoProps, Fields>(
  View,
  { fields: DEFAULT.fields },
  { displayName: 'CmdStateInfo' },
);
