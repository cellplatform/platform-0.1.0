import * as React from 'react';
import { css, color } from '../common';

export type ITestProps = {};

css.global({
  body: {
    color: 'white',
    background: '#ED3C6E',
  },
});

export class Test extends React.PureComponent<ITestProps> {
  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
        PaddingX: 30,
        PaddingY: 40,
      }),
      sample: css({
        Absolute: [30, 50, null, null],
        border: `dashed 1px ${color.format(-0.3)}`,
        backgroundColor: 'rgba(255, 0, 0, 0.4)' /* RED */,
        width: 250,
        height: 120,
        padding: 15,
        borderRadius: 5,
        boxShadow: `0 2px 14px 0 ${color.format(-0.1)}`,
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.sample}>Sample</div>
      </div>
    );
  }
}
