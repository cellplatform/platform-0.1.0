import React from 'react';

import { css, CssValue, R } from '../common';

export type FieldSelectorLabelProps = {
  all: string[];
  field: string;
  style?: CssValue;
};

const View: React.FC<FieldSelectorLabelProps> = (props) => {
  const { field, all } = props;
  const isSubField = Util.isSubField(all, field);

  /**
   * [Render]
   */
  const styles = {
    base: css({}),
    part: css({}),
    subpart: css({ opacity: 0.4 }),
    period: css({}),
  };

  const parts = field.split('.');
  const elParts = parts.map((part, i) => {
    const isLast = i === parts.length - 1;
    const style = css(styles.part, !isLast && isSubField ? styles.subpart : undefined);
    return (
      <React.Fragment key={i}>
        <span {...style}>{part}</span>
        {!isLast && <span {...styles.period}>{'.'}</span>}
      </React.Fragment>
    );
  });

  return <div {...css(styles.base, props.style)}>{elParts}</div>;
};

/**
 * Helpers
 */
const Util = {
  isSubField(all: string[], field: string) {
    if (!field.includes('.')) return false;
    const prefix = field.substring(0, field.lastIndexOf('.'));
    return all.includes(prefix);
  },
};

/**
 * Export
 */
export const FieldSelectorLabel = React.memo(View, (prev, next) => {
  // Props are equal:
  if (!R.equals(prev.all, next.all)) return false;
  if (!R.equals(prev.field, next.field)) return false;
  return true;
});
