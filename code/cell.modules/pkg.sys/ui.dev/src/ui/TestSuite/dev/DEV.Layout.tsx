import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, COLORS, ObjectView } from '../common';
import { Test } from '..';
import { ResultsProps } from '../Results';

export type DevLayoutProps = {
  results: ResultsProps;
  style?: CssValue;
};

export const DevLayout: React.FC<DevLayoutProps> = (props) => {
  const styles = {
    base: css({ flex: 1 }),
    body: css({
      Absolute: 0,
      Flex: 'horizontal-stretch-stretch',
    }),
    left: css({
      flex: 2,
      position: 'relative',
      display: 'flex',
      overflow: 'hidden',
    }),
    right: css({
      position: 'relative',
      flex: 1,
      Scroll: true,
      padding: 10,
      borderLeft: `solid 1px ${color.alpha(COLORS.CLI.MAGENTA, 0.3)}`,
      minWidth: 350,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>
        <div {...styles.left}>
          <Test.View.Results
            {...props.results}
            padding={[20, 30]}
            scroll={props.results.scroll}
            style={{ flex: 1 }}
          />
        </div>
        <div {...styles.right}>
          <ObjectView name={'TestRunResponse'} data={props.results.data} />
        </div>
      </div>
    </div>
  );
};
