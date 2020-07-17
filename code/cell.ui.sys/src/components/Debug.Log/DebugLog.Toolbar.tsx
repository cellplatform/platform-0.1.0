import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { color, css, CssValue, t, ui } from '../../common';
import { Button } from '../primitives';
import * as d from './types';

export type IDebugLogToolbarProps = {
  store: t.IStateObjectWritable<d.IDebugLogState>;
  style?: CssValue;
  onClearClick?: () => void;
};

export class DebugLogToolbar extends React.PureComponent<IDebugLogToolbarProps> {
  private unmounted$ = new Subject();
  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    this.store.changed$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.forceUpdate());
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get store() {
    return this.props.store;
  }

  public get items() {
    return this.store.state.items || [];
  }

  public get total() {
    return this.store.state.total || 0;
  }

  public get isEmpty() {
    return this.total === 0;
  }

  /**
   * [Render]
   */
  public render() {
    const isEmpty = this.isEmpty;
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
        {!isEmpty && <Button onClick={this.props.onClearClick}>Clear</Button>}
      </div>
    );
  }
}
