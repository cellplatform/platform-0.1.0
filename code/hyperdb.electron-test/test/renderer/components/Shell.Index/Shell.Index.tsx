import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil, filter, map, debounceTime } from 'rxjs/operators';
import { color, css, GlamorValue, renderer, t, COLORS, time } from '../../common';
import { Button } from '../primitives';
import { NetworkBullet } from '../NetworkBullet';
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

export type IItem = {
  db: t.IDb<t.ITestDbData>;
  network: t.INetwork;
  name: string;
};

export type IShellIndexState = {
  items?: IItem[];
};

export class ShellIndex extends React.PureComponent<IShellIndexProps, IShellIndexState> {
  /**
   * [Fields]
   */
  public static contextType = renderer.Context;
  public context!: t.ITestRendererContext;
  public state: IShellIndexState = { items: [] };
  private unmounted$ = new Subject();
  private state$ = new Subject<IShellIndexState>();

  /**
   * [Lifecycle]
   */
  public async componentDidMount() {
    const store$ = this.store.change$.pipe(takeUntil(this.unmounted$));
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));
    store$.subscribe(e => this.updateState());

    const db = this.context.db;
    const db$ = db.events$.pipe(takeUntil(this.unmounted$));
    db$.pipe(filter(e => e.type === 'DB_FACTORY/change')).subscribe(e => this.updateState());
    db$
      // Update state when DB name changes.
      .pipe(
        filter(e => e.type === 'DB_FACTORY/created'),
        debounceTime(0),
        map(e => e.payload as t.IDbFactoryCreatedEvent['payload']),
      )
      .subscribe(e => {
        e.db.watch$
          .pipe(
            takeUntil(e.db.dispose$),
            debounceTime(500),
          )
          .subscribe(() => this.updateState());
        e.db.watch<t.ITestDbData>('.sys/dbname');
      });

    // Ensure each DB instance is ready to go.
    const databases = await this.store.get('databases');
    for (let dir of databases) {
      dir = `${await this.store.get('dir')}/${dir}`;
      await db.getOrCreate({ dir, connect: true });
    }

    // Finish up.
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
    const { items: databases = [] } = this.state;
    databases.sort();
    return databases;
  }

  /**
   * [Methods]
   */
  public async updateState() {
    const items = this.context.db.items.map(async item => {
      const { network } = item;
      const db: t.IDb<t.ITestDbData> = item.db;
      const name = (await db.get('.sys/dbname')).value || 'Unnamed';
      return { db, network, name };
    });
    this.state$.next({ items: await Promise.all(items) });
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
    const elList = databases.map(item => this.renderListItem(item));
    return <div {...styles.base}>{elList}</div>;
  }

  private renderListItem(args: IItem) {
    const { selected } = this.props;
    const { db, network, name } = args;
    const dir = db.dir;
    const isSelected = db.dir === selected;

    const dirname = db.dir.substr(db.dir.lastIndexOf('/') + 1);
    const styles = {
      base: css({
        borderBottom: `solid 1px ${color.format(-0.1)}`,
        padding: 8,
        Flex: 'horizontal-spaceBetween-center',
        cursor: !isSelected && 'pointer',
        backgroundColor: isSelected && COLORS.BLUE,
        color: isSelected ? color.format(0.5) : color.format(-0.4),
      }),
      subheading: css({
        marginTop: 2,
        fontSize: 10,
      }),
    };

    const elSelectedBullet = <NetworkBullet key={db.localKey} db={db} network={network} />;
    return (
      <div key={dir} {...styles.base} onMouseDown={this.selectHandler(dir)}>
        <div>
          <Button label={name} isEnabled={!isSelected} theme={{ disabledColor: COLORS.WHITE }} />
          <div {...styles.subheading}>{dirname}</div>
        </div>
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
        <div {...styles.section} onClick={this.props.onNew}>
          <Button label={'new'} />
        </div>
        <div {...styles.section} onClick={this.props.onConnect}>
          <Button label={'join'} />
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
