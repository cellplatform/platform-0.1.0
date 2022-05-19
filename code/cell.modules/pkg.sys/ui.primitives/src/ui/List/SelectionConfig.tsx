import React, { useState } from 'react';
import { retryWhen } from 'rxjs';

import { PropList } from '../PropList';
import { FC, css, CssValue, t } from './common';

/**
 * Types
 */
export type SelectionConfigFields = 'Enabled' | 'Multi' | 'AllowEmpty' | 'ClearOnBlur' | 'Keyboard';
export type SelectionConfigProps = {
  fields?: SelectionConfigFields[];
  title?: string;
  config?: t.ListSelectionConfig;
  style?: CssValue;
  onChange?: (e: { config?: t.ListSelectionConfig }) => void;
};

const CONFIG: t.ListSelectionConfig = { multi: true, allowEmpty: true };
const FIELDS: SelectionConfigFields[] = [
  'Enabled',
  'Multi',
  'AllowEmpty',
  'ClearOnBlur',
  'Keyboard',
];
const DEFAULT = { CONFIG, FIELDS };

/**
 * Component
 */
const View: React.FC<SelectionConfigProps> = (props) => {
  const { config, onChange, fields = FIELDS } = props;
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
    onClick: (e: t.PropListValueEventArgs) => void,
  ) => {
    if (!fields.includes(field)) return;
    items.push({
      label,
      value: { kind: 'Switch', data: Boolean(value), onClick },
    });
  };

  add('Enabled', isEnabled ? 'Selection (enabled)' : 'Selection (disabled)', isEnabled, (e) => {
    const next = !Boolean(e.value.data);
    if (next === true) onChange?.({ config: prev ?? CONFIG });
    if (next === false) {
      setPrev(config);
      onChange?.({ config: undefined });
    }
  });

  if (isEnabled) {
    add('Multi', 'Select multiple items', config?.multi, (e) => {
      const multi = !Boolean(e.value.data);
      onChange?.({ config: { ...(config || CONFIG), multi } });
    });

    add('AllowEmpty', 'Allow empty selection', config?.allowEmpty, (e) => {
      const allowEmpty = !Boolean(e.value.data);
      onChange?.({ config: { ...(config || CONFIG), allowEmpty } });
    });

    add('ClearOnBlur', 'Clear selection on blur', config?.clearOnBlur, (e) => {
      const clearOnBlur = !Boolean(e.value.data);
      onChange?.({ config: { ...(config || CONFIG), clearOnBlur } });
    });

    add('Keyboard', 'Keyboard support', config?.keyboard, (e) => {
      const keyboard = !Boolean(e.value.data);
      onChange?.({ config: { ...(config || DEFAULT.CONFIG), keyboard } });
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
  DEFAULT: typeof DEFAULT;
};
export const SelectionConfig = FC.decorate<SelectionConfigProps, Fields>(
  View,
  { isConfigEnabled, DEFAULT },
  { displayName: 'SelectionConfig' },
);
