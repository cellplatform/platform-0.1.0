import React, { useEffect, useRef, useState } from 'react';
import { Radios, color, COLORS, css, CssValue, t, DEFAULT } from '../common';
import { Util } from '../Util';

type Index = number;

export type DefsSelectorProps = t.PhotoProps & {
  onSelectionChange?: (e: { from: Index; to: Index }) => void;
};

export const DefsSelector: React.FC<DefsSelectorProps> = (props) => {
  const { index = DEFAULT.index } = props;
  const defs = Util.toDefs(props.def);

  /**
   * [Render]
   */
  const styles = {
    base: css({}),
    label: css({ fontFamily: 'monospace', fontSize: 12 }),
  };

  const items: t.OptionItem[] = defs.map((e, i) => {
    const url = Util.toUrl(e.url);
    const label = `${url.pathname.replace(/^\//, '')}`;
    return { label, value: url.href };
  });

  return (
    <div {...css(styles.base, props.style)}>
      <Radios
        selected={index}
        items={items}
        onClick={(e) => {
          props.onSelectionChange?.({
            from: index,
            to: e.index,
          });
        }}
        factory={{
          label: (e) => <Label index={e.index} tooltip={e.value} text={e.label} />,
        }}
      />
    </div>
  );
};

export type LabelProps = {
  index: number;
  text: string;
  tooltip?: string;
  style?: CssValue;
};

export const Label: React.FC<LabelProps> = (props) => {
  const styles = {
    base: css({ flex: 1, Flex: 'x-spaceBetween-center' }),
    label: css({ fontFamily: 'monospace', fontSize: 12 }),
    index: css({ fontFamily: 'monospace', fontSize: 12 }),
  };
  return (
    <div {...css(styles.base, props.style)} title={props.tooltip}>
      <div {...styles.label}>{props.text}</div>
      <div {...styles.index}>{props.index}</div>
    </div>
  );
};
