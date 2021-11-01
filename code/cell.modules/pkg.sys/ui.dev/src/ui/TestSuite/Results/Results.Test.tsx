import React from 'react';

import { COLORS, css, CssValue, Icons, t } from '../common';
import { TestError } from './Results.Test.Error';

export type TestResultProps = {
  data: t.TestRunResponse;
  style?: CssValue;
};

export const TestResult: React.FC<TestResultProps> = (props) => {
  const { data } = props;
  const excluded = data.excluded ?? [];
  const isSkipped = excluded.includes('skip');
  const isExcludedViaOnly = excluded.includes('only');

  // NB: still show if "skipped" to the test retains visibility until either implemented or deleted
  if (isExcludedViaOnly && !isSkipped) return null;

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative', marginBottom: 4 }),
    line: {
      base: css({ Flex: 'horizontal-stretch-stretch' }),
      icon: css({ marginRight: 6 }),
      description: css({ flex: 1 }),
      elapsed: css({ opacity: 0.2, userSelect: 'none' }),
    },
    error: css({ marginLeft: 25 }),
  };

  const elIconSuccess = !isSkipped && data.ok && <Icons.Tick size={16} color={COLORS.CLI.LIME} />;
  const elIconFail = !isSkipped && !data.ok && <Icons.Close size={16} color={COLORS.CLI.MAGENTA} />;
  const elIconSkipped = isSkipped && <Icons.Skip size={16} color={COLORS.CLI.CYAN} />;

  const elError = data.error && <TestError data={data} style={styles.error} />;

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.line.base}>
        <div {...styles.line.icon}>
          {elIconSuccess}
          {elIconFail}
          {elIconSkipped}
        </div>
        <div {...styles.line.description}>{data.description}</div>
        {<div {...styles.line.elapsed}>{isSkipped ? '-' : `${data.elapsed}ms`}</div>}
      </div>
      {elError}
    </div>
  );
};
