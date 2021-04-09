import React from 'react';
import { LabelChip } from './Chip';

export const Format = {
  todo(children?: React.ReactNode) {
    if (typeof children !== 'string') return children;

    const match = /\[TODO\]/g.exec(children);
    if (!Array.isArray(match)) return children;

    const value = match[0];
    const index = match.index;
    const left = match.input.substring(0, index).trimRight();
    const right = match.input.substring(index + value.length).trimLeft();

    return (
      <>
        {left} <LabelChip>TODO</LabelChip> {right}
      </>
    );
  },
};
