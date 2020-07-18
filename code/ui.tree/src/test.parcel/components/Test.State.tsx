import { css, CssValue } from '@platform/css';
import * as React from 'react';
import { Subject } from 'rxjs';

export type ITestProps = { style?: CssValue };

export class Test extends React.PureComponent<ITestProps> {
  private unmounted$ = new Subject();

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    //
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    const styles = { base: css({}) };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div>Test State</div>
      </div>
    );
  }
}
