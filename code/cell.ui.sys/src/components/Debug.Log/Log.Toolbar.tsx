import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { color, css, CssValue, ui } from '../../common';
import { Button, Switch } from '../primitives';
import * as t from './types';

export type ILogToolbarProps = {
  store: t.IDebugLogWrite;
  style?: CssValue;
  onClearClick?: () => void;
};

export class LogToolbar extends React.PureComponent<ILogToolbarProps> {
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

  public get isEnabled() {
    return this.store.state.isEnabled;
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
        Flex: 'horizontal-center-spaceBetween',
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        {this.renderLeft()}
        {this.renderRight()}
      </div>
    );
  }

  private renderLeft() {
    const isEmpty = this.isEmpty;
    const styles = {
      base: css({
        Flex: 'horizontal-center-center',
      }),
    };
    return (
      <div {...styles.base}>
        {!isEmpty && <Button onClick={this.props.onClearClick}>Clear</Button>}
      </div>
    );
  }

  private renderRight() {
    const styles = {
      base: css({
        Flex: 'horizontal-center-center',
      }),
    };
    return (
      <div {...styles.base}>
        <Switch value={this.isEnabled} height={16} onMouseDown={this.onEnabledClick} />
      </div>
    );
  }

  /**
   * [Handlers]
   */

  private onEnabledClick = () => {
    this.store.change((m) => (m.isEnabled = !this.isEnabled));
  };
}
