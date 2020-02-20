import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue } from '../common';

console.log('parse page', 'Bar.tsx');

export type IBarProps = { style?: CssValue };
export type IBarState = {};

export class Bar extends React.PureComponent<IBarProps, IBarState> {
  public state: IBarState = {};
  private state$ = new Subject<Partial<IBarState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IBarProps) {
    super(props);
  }

  public componentDidMount() {
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
        <div>Bar</div>
      </div>
    );
  }
}

export function init() {
  console.log('init bar');
}
