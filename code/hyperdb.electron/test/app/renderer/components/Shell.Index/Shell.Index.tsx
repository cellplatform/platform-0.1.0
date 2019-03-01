import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { color, css, GlamorValue, renderer, t } from '../../common';
import { Button } from '../primitives';
import {
  ShellIndexSelectEventHandler,
  ShellIndexNewEventHandler,
  ShellIndexConnectEventHandler,
} from './types';

export type IShellIndexProps = {
  style?: GlamorValue;
  onSelect?: ShellIndexSelectEventHandler;
  onNew?: ShellIndexNewEventHandler;
  onConnect?: ShellIndexConnectEventHandler;
};

export type IShellIndexState = {
  databases: string[];
};

export class ShellIndex extends React.PureComponent<IShellIndexProps, IShellIndexState> {
  /**
   * [Fields]
   */
  public static contextType = renderer.Context;
  public context!: renderer.ReactContext;
  public state: IShellIndexState = { databases: [] };
  private unmounted$ = new Subject();

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    const store$ = this.store.change$.pipe(takeUntil(this.unmounted$));

    store$.subscribe(e => this.updateState());
    this.updateState();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */
  private get store() {
    return this.context.store as t.ITestStore;
  }

  /**
   * [Methods]
   */
  public async updateState() {
    const databases = await this.store.get('databases');
    this.setState({ databases });
  }

  /**
   * [Renderers]
   */
  public render() {
    const styles = {
      base: css({
        position: 'relative',
        borderRight: `solid 1px ${color.format(-0.1)}`,
        Scroll: true,
        fontSize: 14,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        {this.renderList()}
        {this.renderActions()}
      </div>
    );
  }

  private renderList() {
    const { databases = [] } = this.state;
    const styles = {
      base: css({}),
      li: css({
        borderBottom: `solid 1px ${color.format(-0.1)}`,
        padding: 8,
        cursor: 'pointer',
      }),
    };
    const elList = databases.map((dir, i) => {
      return (
        <div key={i} {...styles.li}>
          <Button label={dir} onClick={this.selectHandler(dir)} />
        </div>
      );
    });
    return <div {...styles.base}>{elList}</div>;
  }

  private renderActions() {
    const styles = {
      base: css({
        Flex: 'horizontal-stretch-stretch',
        borderBottom: `solid 1px ${color.format(-0.1)}`,
      }),
      section: css({
        padding: 8,
        flex: 1,
        Flex: 'center-center',
        ':first-child': {
          borderRight: `solid 1px ${color.format(-0.1)}`,
        },
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.section}>
          <Button label={'new'} onClick={this.props.onNew} />
        </div>
        <div {...styles.section}>
          <Button label={'connect'} onClick={this.props.onConnect} />
        </div>
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private selectHandler = (dir: string) => {
    return () => {
      const { onSelect } = this.props;
      if (onSelect) {
        onSelect({ dir });
      }
    };
  };
}
