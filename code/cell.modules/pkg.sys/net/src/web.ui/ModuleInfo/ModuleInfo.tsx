import React from 'react';

import { css, CssValue, pkg, PropList, PropListItem } from '../common';
import { ModuleInfoConstants } from './constants';
import * as k from './types';

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
    if (field === 'Module') push({ label: 'Module', value: `${pkg.name}@${pkg.version}` });
    if (field === 'Module.Name') push({ label: 'Name', value: pkg.name });
    if (field === 'Module.Version') items.push({ label: 'Version', value: pkg.version });
  });

  /**
   * [Render]
   */
  const styles = { base: css({ position: 'relative', width, minWidth, maxWidth }) };
  const elProps = <PropList items={items} defaults={{ clipboard: false }} />;
  return <div {...css(styles.base, props.style)}>{elProps}</div>;
};
