import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, ObjectView, Icons, COLORS } from '../common';

export type TestResultProps = {
  data: t.TestRunResponse;
  style?: CssValue;
};

export const TestResult: React.FC<TestResultProps> = (props) => {
  const { data } = props;

  const styles = {
    base: css({ position: 'relative' }),
    line: {
      base: css({ Flex: 'horizontal-stretch-stretch' }),
      icon: css({ marginRight: 6 }),
      description: css({ flex: 1 }),
      elapsed: css({ opacity: 0.2, userSelect: 'none' }),
    },
    error: css({
      marginLeft: 20,
    }),
  };

  const elIconSuccess = data.ok && <Icons.Tick size={16} color={COLORS.CLI.LIME} />;
  const elIconFail = !data.ok && <Icons.Close size={16} color={COLORS.CLI.MAGENTA} />;

  const elError = data.error && (
    <div {...styles.error}>
      <ObjectView data={data.error} fontSize={12} />
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.line.base}>
        <div {...styles.line.icon}>
          {elIconSuccess}
          {elIconFail}
        </div>
        <div {...styles.line.description}>{data.description}</div>
        <div {...styles.line.elapsed}>{data.elapsed}ms</div>
      </div>
      {elError}
    </div>
  );
};
