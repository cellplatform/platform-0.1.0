import * as React from 'react';
import { css, style, color } from '../common';

export type ITestProps = {};

style.global({
  body: {
    color: 'white',
    background: '#ED3C6E',
    fontFamily: undefined,
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
        fontFamily: undefined,
        border: `solid 1px ${color.format(0.9)}`,
      }),
      inner: css({
        backgroundColor: 'rgba(255, 0, 0, 0.4)',
        MarginX: 30,
        MarginY: 50,
      }),
      sample: css({
        Absolute: [30, 50, null, null],
        border: `dashed 1px ${color.format(-0.3)}`,
        backgroundColor: 'rgba(255, 0, 0, 0.4)',
        width: 250,
        height: 120,
        padding: 15,
        borderRadius: 5,
        boxShadow: `0 2px 14px 0 ${color.format(-0.1)}`,
      }),
    };
    // NB: Nested `css(...)` calls are correctly unfurled and applied.
    return (
      <div {...css(styles.base, css(styles.inner))}>
        <div {...styles.sample}>Sample</div>
      </div>
    );
  }
}
