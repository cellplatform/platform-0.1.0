import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t, PropList, rx } from '../common';

type Fields = 'Namespace' | 'Instance.Id' | 'Instance.Bus';

const FIELDS: Fields[] = ['Namespace', 'Instance.Id', 'Instance.Bus'];
export const DEFAULT = { FIELDS };

export type CmdBarGrammerInfoProps = {
  instance: t.CmdBarInstance;
  title?: string;
  fields?: Fields[];
  theme?: 'Light' | 'Dark';
  size?: {
    width?: number;
    minWidth?: number;
    maxWidth?: number;
  };

  style?: CssValue;
};

export const CmdBarGrammerInfo: React.FC<CmdBarGrammerInfoProps> = (props) => {
  const { instance, fields = DEFAULT.FIELDS, size = {} } = props;
  const { width, minWidth = 230, maxWidth } = size;

  const items = PropList.builder<Fields>()
    .field('Namespace', { label: 'Namespace', value: `sys.crypto` }) // TODO - examnple 🐷
    .field('Instance.Id', { label: 'Instance', value: `"${instance.id}"` })
    .field('Instance.Bus', { label: 'Instance.Bus', value: rx.bus.instance(instance.bus) })
    .items(fields);

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative', width, minWidth, maxWidth }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <PropList
        title={props.title ?? 'Command Grammer'}
        items={items}
        defaults={{ clipboard: false }}
        theme={props.theme ?? 'Dark'}
      />
    </div>
  );
};
