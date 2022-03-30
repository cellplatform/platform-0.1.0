import React, { useEffect, useRef, useState } from 'react';

import { PropList } from '../../PropList';
import { css, CssValue, FC, t } from '../common';

import * as k from '../types';

/**
 * Types
 */
export type CmdCardStateInfoProps = {
  title?: string;
  fields?: k.CmdCardStateInfoFields[];
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  style?: CssValue;
};

/**
 * Constants
 */
const ALL_FIELDS: t.CmdCardStateInfoFields[] = ['Title', 'State', 'Version'];
const DEFAULT_FIELDS: t.CmdCardStateInfoFields[] = ['Title', 'State', 'Version'];
const fields = {
  all: ALL_FIELDS,
  default: DEFAULT_FIELDS,
};

/**
 * Component
 */
export const View: React.FC<CmdCardStateInfoProps> = (props) => {
  const { width, minWidth = 230, maxWidth, fields = DEFAULT_FIELDS } = props;

  const title = fields.includes('Title') ? props.title ?? 'Command Card' : undefined;
  const items = PropList.builder<k.CmdCardStateInfoFields>()
    .field('State', { label: 'State', value: { data: '{FOO}', monospace: true } })
    .field('Version', { label: 'Version', value: { data: '{FOO}', monospace: true } })
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
  fields: typeof fields;
};
export const CmdCardStateInfo = FC.decorate<CmdCardStateInfoProps, Fields>(
  View,
  { fields },
  { displayName: 'CmdCardStateInfo' },
);
