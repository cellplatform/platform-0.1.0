import React from 'react';

import { css, CssValue, pkg, PropList, t, DEFAULT, FIELDS, FC } from './common';

export type ModuleInfoProps = {
  fields?: t.ModuleInfoFields[];
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  style?: CssValue;
};

const View: React.FC<ModuleInfoProps> = (props) => {
  const { width, minWidth = 230, maxWidth, fields = DEFAULT.fields } = props;

  const items = PropList.builder<t.ModuleInfoFields>()
    .field('Module', { label: 'Module', value: `${pkg.name}@${pkg.version}` })
    .field('Module.Name', { label: 'Name', value: pkg.name })
    .field('Module.Version', { label: 'Version', value: pkg.version })
    .items(fields);

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative', width, minWidth, maxWidth }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <PropList items={items} defaults={{ clipboard: false }} />
    </div>
  );
};

/**
 * Export
 */
type Fields = {
  DEFAULT: typeof DEFAULT;
  FIELDS: typeof FIELDS;
};
export const ModuleInfo = FC.decorate<ModuleInfoProps, Fields>(
  View,
  { DEFAULT, FIELDS },
  { displayName: 'ModuleInfo' },
);
