import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { color, css, CssValue } from '../../common';
import { Button } from '../primitives';

export type IDebugLogToolbarProps = {
  style?: CssValue;
  onClearClick?: () => void;
};
export type IDebugLogToolbarState = {};

export class DebugLogToolbar extends React.PureComponent<
  IDebugLogToolbarProps,
  IDebugLogToolbarState
> {
  public state: IDebugLogToolbarState = {};
  private state$ = new Subject<Partial<IDebugLogToolbarState>>();
  private unmounted$ = new Subject();

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        position: 'relative',
        boxSizing: 'border-box',
        borderBottom: `solid 1px ${color.format(-0.1)}`,
        PaddingX: 10,
        fontSize: 12,
        height: 32,
        Flex: 'horizontal-center-start',
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <Button onClick={this.props.onClearClick}>Clear</Button>
      </div>
    );
  }
}
