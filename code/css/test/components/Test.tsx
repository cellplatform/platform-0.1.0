import * as React from 'react';
import { css, color } from '../common';

export type ITestProps = {};

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
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
        width: 250,
        height: 120,
        padding: 15,
        borderRadius: 5,
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.sample}>Sample</div>
      </div>
    );
  }
}
