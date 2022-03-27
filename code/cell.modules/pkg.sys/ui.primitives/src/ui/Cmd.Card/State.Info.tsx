import React, { useEffect, useRef, useState } from 'react';

import { PropList } from '../PropList';
import { css, CssValue, FC, t } from './common';

import * as k from './types';

/**
 * Types
 */
export type CmdCardStateInfoProps = {
  fields?: k.CmdCardStateInfoFields[];
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  style?: CssValue;
};

/**
 * Constants
 */
const ALL_FIELDS: t.CmdCardStateInfoFields[] = ['Module', 'Module.Name', 'Module.Version'];
const DEFAULT_FIELDS: t.CmdCardStateInfoFields[] = ['Module.Name', 'Module.Version'];
const fields = {
  all: ALL_FIELDS,
  default: DEFAULT_FIELDS,
};

/**
 * Component
 */
export const View: React.FC<CmdCardStateInfoProps> = (props) => {
  const { width, minWidth = 230, maxWidth, fields = DEFAULT_FIELDS } = props;

  const items = PropList.builder<k.CmdCardStateInfoFields>()
    .field('Module', { label: 'Module', value: 'FOO' })
    .field('Module.Name', { label: 'Name', value: 'FOO' })
    .field('Module.Version', { label: 'Version', value: 'FOO' })
    .items(fields);

  /**
   * [Render]
   */
  const styles = { base: css({ position: 'relative', width, minWidth, maxWidth }) };

  return (
    <div {...css(styles.base, props.style)}>
      <PropList items={items} defaults={{ clipboard: false }} />
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
