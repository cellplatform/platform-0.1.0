import React, { useState } from 'react';

import { PropList } from '../PropList';
import { FC, css, CssValue, t, DEFAULT_SELECTION } from './common';
import { Wrangle } from './Wrangle';

/**
 * Types
 */
export type SelectionConfigFields = 'Enabled' | 'Multi' | 'AllowEmpty' | 'ClearOnBlur' | 'Keyboard';
export type SelectionConfigProps = {
  fields?: SelectionConfigFields[];
  title?: string;
  config?: t.ListSelectionConfig | boolean;
  style?: CssValue;
  onChange?: (e: { config?: t.ListSelectionConfig }) => void;
};

const CONFIG: t.ListSelectionConfig = DEFAULT_SELECTION;
const FIELDS: SelectionConfigFields[] = [
  'Enabled',
  'Multi',
  'AllowEmpty',
  'ClearOnBlur',
  'Keyboard',
];
const DEFAULTS = { CONFIG, FIELDS };

/**
 * Component
 */
const View: React.FC<SelectionConfigProps> = (props) => {
  const { onChange, fields = FIELDS } = props;
  const config = Wrangle.selection(props.config);
  const isEnabled = isConfigEnabled(config);
  const [prev, setPrev] = useState<t.ListSelectionConfig>();

  /**
   * [Render]
   */
  const styles = {
    base: css({}),
  };

  const items: t.PropListItem[] = [];

  const add = (
    field: SelectionConfigFields,
    label: string,
    value: boolean | undefined,
    indent: number,
    onClick: (e: t.PropListValueEventArgs) => void,
  ) => {
    if (!fields.includes(field)) return;
    items.push({
      indent,
      label,
      value: { kind: 'Switch', data: Boolean(value), onClick },
    });
  };

  add('Enabled', isEnabled ? 'Selection (enabled)' : 'Selection (disabled)', isEnabled, 0, (e) => {
    const next = !Boolean(e.value.data);
    if (next === true) onChange?.({ config: prev ?? CONFIG });
    if (next === false) {
      setPrev(config);
      onChange?.({ config: undefined });
    }
  });

  if (isEnabled) {
    const indent = 15;

    add('Multi', 'Allow multi-item selection', config?.multi, indent, (e) => {
      const multi = !Boolean(e.value.data);
      onChange?.({ config: { ...(config || CONFIG), multi } });
    });

    add('AllowEmpty', 'Allow nothing to be selected', config?.allowEmpty, indent, (e) => {
      const allowEmpty = !Boolean(e.value.data);
      onChange?.({ config: { ...(config || CONFIG), allowEmpty } });
    });

    add('ClearOnBlur', 'Clear selection on blur', config?.clearOnBlur, indent, (e) => {
      const clearOnBlur = !Boolean(e.value.data);
      onChange?.({ config: { ...(config || CONFIG), clearOnBlur } });
    });

    add('Keyboard', 'Keyboard support', config?.keyboard, indent, (e) => {
      const keyboard = !Boolean(e.value.data);
      onChange?.({ config: { ...(config || DEFAULTS.CONFIG), keyboard } });
    });
  }

  return (
    <div {...css(styles.base, props.style)}>
      <PropList title={props.title} items={items} defaults={{ clipboard: false }} />
    </div>
  );
};

/**
 * Helpers
 */
function isConfigEnabled(config?: t.ListSelectionConfig) {
  if (!config) return false;
  return Object.values(config).filter((value) => value !== undefined).length > 0;
}

/**
 * Export
 */
type Fields = {
  isConfigEnabled: typeof isConfigEnabled;
  DEFAULTS: typeof DEFAULTS;
  default: t.ListSelectionConfig;
};
export const SelectionConfig = FC.decorate<SelectionConfigProps, Fields>(
  View,
  { isConfigEnabled, DEFAULTS, default: CONFIG },
  { displayName: 'SelectionConfig' },
);
