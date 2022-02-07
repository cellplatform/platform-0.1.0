import React from 'react';
import { color, css, CssValue, t, PropList, PropListItem, pkg } from '../common';

import * as k from './types';
import { ModuleInfoConstants } from './constants';

export type ModuleInfoProps = {
  fields?: k.ModuleInfoFields[];
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  style?: CssValue;
};

export const ModuleInfo: React.FC<ModuleInfoProps> = (props) => {
  const { width, minWidth = 230, maxWidth, fields = ModuleInfoConstants.DEFAULT.FIELDS } = props;

  const items: PropListItem[] = [];
  const push = (...input: PropListItem[]) => items.push(...input);

  fields.forEach((field) => {
    if (field === 'module') push({ label: 'Module', value: `${pkg.name}@${pkg.version}` });
    if (field === 'module.name') push({ label: 'Name', value: pkg.name });
    if (field === 'module.version') items.push({ label: 'Version', value: pkg.version });
  });

  /**
   * [Render]
   */
  const styles = { base: css({ position: 'relative', width, minWidth, maxWidth }) };
  const elProps = <PropList items={items} defaults={{ clipboard: false }} />;

  return <div {...css(styles.base, props.style)}>{elProps}</div>;
};
