import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue } from '../common';

export type ITestTextInputProps = { style?: GlamorValue };
export type ITestTextInputState = {};

export class TestTextInput extends React.PureComponent<ITestTextInputProps, ITestTextInputState> {
  public state: ITestTextInputState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestTextInputState>>();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
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
        <div>TestTextInput</div>
      </div>
    );
  }
}
