import React from 'react';
import { color, css, CssValue, t, PropList, PropListItem, pkg } from '../../common';

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
  const { width, minWidth = 250, maxWidth, fields = ModuleInfoConstants.DEFAULT.FIELDS } = props;

  const items = PropList.builder<k.ModuleInfoFields>()
    .field('Module', { label: 'Module', value: `${pkg.name}@${pkg.version}` })
    .field('Module.Name', { label: 'Name', value: pkg.name })
    .field('Module.Version', { label: 'Version', value: pkg.version })
    .field('DataFormat', () => {
      const version = pkg.dependencies?.automerge || 'ERROR';
      return { label: 'Data Format', value: `automerge@${version}` };
    })
    .items(fields);

  /**
   * [Render]
   */
  const styles = { base: css({ position: 'relative', width, minWidth, maxWidth }) };
  const elProps = <PropList items={items} defaults={{ clipboard: false }} />;

  return <div {...css(styles.base, props.style)}>{elProps}</div>;
};
