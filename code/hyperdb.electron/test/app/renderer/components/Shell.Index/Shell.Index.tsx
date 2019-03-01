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
  selected?: string;
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
  private state$ = new Subject<IShellIndexState>();

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    const store$ = this.store.change$.pipe(takeUntil(this.unmounted$));
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));
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

  private get databases() {
    const { databases = [] } = this.state;
    databases.sort();
    return databases;
  }

  /**
   * [Methods]
   */
  public async updateState() {
    const databases = await this.store.get('databases');
    this.state$.next({ databases });
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
    const databases = this.databases;
    const styles = {
      base: css({}),
    };
    const elList = databases.map(dir => this.renderListItem({ dir }));
    return <div {...styles.base}>{elList}</div>;
  }

  private renderListItem(args: { dir: string }) {
    const BULLET_SIZE = 8;
    const { selected } = this.props;
    const { dir } = args;
    const isSelected = dir === selected;

    const styles = {
      li: css({
        borderBottom: `solid 1px ${color.format(-0.1)}`,
        padding: 8,
        Flex: 'horizontal-spaceBetween-center',
        cursor: !isSelected && 'pointer',
      }),
      selected: css({
        width: BULLET_SIZE,
        height: BULLET_SIZE,
        borderRadius: BULLET_SIZE,
        backgroundImage: `linear-gradient(-180deg, #70EB07 0%, #35AF06 100%)`,
      }),
    };

    const elSelectedBullet = isSelected && <div {...styles.selected} />;
    return (
      <div key={dir} {...styles.li} onClick={this.selectHandler(dir)}>
        <Button label={dir} isEnabled={!isSelected} theme={{ disabledColor: color.format(-0.7) }} />
        {elSelectedBullet}
      </div>
    );
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
          <Button label={'join'} onClick={this.props.onConnect} />
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
