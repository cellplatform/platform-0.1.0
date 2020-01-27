import * as React from 'react';
import { css, CssValue, value } from '../../common';

export type ITestPanelProps = {
  title?: string;
  marginBottom?: number;
  style?: CssValue;
};

export class TestPanel extends React.PureComponent<ITestPanelProps> {
  private renderCount = 0;

  public render() {
    this.renderCount++;
    const marginBottom = value.defaultValue(this.props.marginBottom, 50);
    const styles = {
      base: css({
        position: 'relative',
        marginBottom,
      }),
      h2: css({
        fontSize: 18,
        marginBottom: 8,
      }),
      body: css({
        position: 'relative',
      }),
      renderCount: css({
        Absolute: [1, 3, null, null],
        fontSize: 10,
        opacity: 0.5,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <h2 {...styles.h2}>{this.props.title || 'Untitled'}</h2>
        <div {...styles.renderCount}>{this.renderCount}</div>
        <div {...styles.body}>{this.props.children}</div>
      </div>
    );
  }
}
