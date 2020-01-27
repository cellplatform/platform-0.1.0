import * as React from 'react';
import { Subject } from 'rxjs';
import { debounceTime, filter, map, takeUntil } from 'rxjs/operators';

import { color, COLORS, css, CssValue, renderer, t } from '../../common';
import { NetworkBullet } from '../NetworkBullet';
import { Button } from '../primitives';
import {
  ShellIndexConnectEventHandler,
  ShellIndexNewEventHandler,
  ShellIndexSelectEventHandler,
} from './types';

export type IShellIndexProps = {
  style?: CssValue;
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
  private unmounted$ = new Subject<{}>();
  private state$ = new Subject<IShellIndexState>();

  /**
   * [Lifecycle]
   */
  public async componentWillMount() {
    const store$ = this.store.change$.pipe(takeUntil(this.unmounted$));
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));

    const updateState$ = new Subject();
    updateState$
      .pipe(
        takeUntil(this.unmounted$),
        debounceTime(50),
      )
      .subscribe(() => this.updateState());

    store$.subscribe(e => updateState$.next());

    const db = this.context.db;
    const db$ = db.events$.pipe(takeUntil(this.unmounted$));
    db$.pipe(filter(e => e.type === 'DB_FACTORY/change')).subscribe(e => updateState$.next());
    db$
      // Update state when DB name changes.
      .pipe(
        filter(e => e.type === 'DB_FACTORY/created'),
        map(e => e.payload as t.IDbFactoryCreatedEvent['payload']),
      )
      .subscribe(e => {
        e.db.watch$.pipe(debounceTime(300)).subscribe(() => {
          updateState$.next();
        });
        e.db.watch<t.ITestDbData>('.sys/dbname');
      });

    // Ensure each DB instance is ready to go.
    const databases = await this.store.get('databases');
    for (let dir of databases || []) {
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

  private get isEmpty() {
    return this.databases.length === 0;
  }

  /**
   * [Methods]
   */
  public async updateState() {
    const wait = this.context.db.items.map(async item => {
      const { network } = item;
      const db: t.IDb<t.ITestDbData> = item.db;
      const name = (await db.get('.sys/dbname')).value || 'Unnamed';
      return { db, network, name };
    });
    const items = await Promise.all(wait);
    this.state$.next({ items });
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
        userSelect: 'none',
      }),
      empty: css({
        fontSize: 11,
        opacity: 0.4,
        paddingTop: 8,
        textAlign: 'center',
      }),
    };

    const isEmpty = this.isEmpty;
    const elEmpty = isEmpty && <div {...styles.empty}>No databases to display.</div>;

    return (
      <div {...css(styles.base, this.props.style)}>
        {elEmpty}
        {!isEmpty && this.renderList()}
        {/* {this.renderActions()} */}
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
        cursor: !isSelected ? 'pointer' : undefined,
        backgroundColor: isSelected ? COLORS.BLUE : undefined,
        color: isSelected ? color.format(0.5) : color.format(-0.4),
      }),
      content: css({
        flex: 1,
        marginRight: 4,
      }),
      subheading: css({
        marginTop: 2,
        fontSize: 10,
        Flex: 'horizontal',
        flex: 1,
      }),
      selectedButton: css({
        color: COLORS.WHITE,
        marginLeft: 6,
      }),
    };

    const elSelectedBullet = <NetworkBullet key={db.localKey} db={db} network={network} />;

    const elReconnect = isSelected && (
      <Button
        label={'reconnect'}
        style={styles.selectedButton}
        onClick={this.reconnectHandler(args)}
      />
    );

    return (
      <div key={dir} {...styles.base} onMouseDown={this.selectHandler(dir)}>
        <div {...styles.content}>
          <Button label={name} isEnabled={!isSelected} theme={{ disabledColor: COLORS.WHITE }} />
          <div {...styles.subheading}>
            <div>{dirname}</div>
            {elReconnect}
          </div>
        </div>
        {elSelectedBullet}
      </div>
    );
  }

  // private renderActions() {
  //   const styles = {
  //     base: css({
  //       Flex: 'horizontal-stretch-stretch',
  //       borderBottom: `solid 1px ${color.format(-0.1)}`,
  //     }),
  //     section: css({
  //       padding: 8,
  //       flex: 1,
  //       Flex: 'center-center',
  //       ':first-child': {
  //         borderRight: `solid 1px ${color.format(-0.1)}`,
  //       },
  //     }),
  //   };
  //   return (
  //     <div {...styles.base}>
  //       <div {...styles.section} onClick={this.props.onNew}>
  //         <Button label={'new'} />
  //       </div>
  //       <div {...styles.section} onClick={this.props.onConnect}>
  //         <Button label={'join'} />
  //       </div>
  //     </div>
  //   );
  // }

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

  private reconnectHandler = (args: IItem) => {
    return () => {
      args.network.reconnect();
    };
  };
}
