import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, ObjectView } from '../common';

export type ResultsProps = {
  data?: any;
  style?: CssValue;
};

export const Results: React.FC<ResultsProps> = (props) => {
  const styles = {
    base: css({
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      Test Results
      <ObjectView data={props.data} expandLevel={3} />
    </div>
  );
};
