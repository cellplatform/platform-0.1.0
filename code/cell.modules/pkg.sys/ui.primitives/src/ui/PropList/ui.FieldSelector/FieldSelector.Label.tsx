import React from 'react';

import { css, CssValue } from '../common';
import { Util } from './Util';

export type FieldSelectorLabelProps = {
  all: string[];
  field: string;
  style?: CssValue;
  onClick?: () => void;
};

export const FieldSelectorLabel: React.FC<FieldSelectorLabelProps> = (props) => {
  const { field, all } = props;
  const isSubField = Util.isSubField(all, field);

  /**
   * [Render]
   */
  const styles = {
    subpart: css({ opacity: 0.4 }),
  };

  const parts = field.split('.');
  const elParts = parts.map((part, i) => {
    const isLast = i === parts.length - 1;
    const style = !isLast && isSubField ? styles.subpart : undefined;
    return (
      <React.Fragment key={i}>
        <span {...style}>{part}</span>
        {!isLast && <span>{'.'}</span>}
      </React.Fragment>
    );
  });

  return (
    <div {...css(props.style)} onMouseDown={props.onClick}>
      {elParts}
    </div>
  );
};
