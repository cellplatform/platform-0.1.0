import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue, COLORS, t, ui, onStateChanged } from '../../common';
import { IPropListItem, PropList } from '../primitives';
import { SidebarDebug } from './Sidebar.debug';

export type ISidebarProps = { style?: CssValue };
export type ISidebarState = {};

export class Sidebar extends React.PureComponent<ISidebarProps, ISidebarState> {
  public state: ISidebarState = {};
  private state$ = new Subject<Partial<ISidebarState>>();
  private unmounted$ = new Subject<{}>();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    const ctx = this.context;
    const changes = onStateChanged(ctx.event$, this.unmounted$);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));

    changes
      .on('APP:IDE/types/data', 'APP:IDE/types/unload')
      .pipe()
      .subscribe((e) => {
        this.forceUpdate();
      });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get store() {
    return this.context.getState();
  }

  public get isLoaded() {
    return Boolean(this.store.uri);
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
      }),
      bg: css({
        Absolute: 0,
        backgroundColor: color.format(0.4),
        borderLeft: `solid 1px ${color.format(-0.1)}`,
      }),
      body: css({
        Absolute: 0,
        padding: 20,
        paddingTop: 15,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.bg}></div>
        <div {...styles.body}>{this.renderProps()}</div>
      </div>
    );
  }

  private renderProps() {
    const isLoaded = this.isLoaded;
    const styles = {
      base: css({}),
    };

    const state = this.store;
    const typesystem = state.typesystem;
    const isPulled = Boolean(typesystem);
    const typeDefs = typesystem?.defs || [];

    const elTypes = typeDefs.map((def, i) => {
      return <div key={i}>{this.renderType(def)}</div>;
    });

    const items: IPropListItem[] = [
      { label: 'language', value: 'typescript' },
      {
        label: 'type definitions',
        value: isPulled ? 'unload' : 'load',
        visible: isLoaded,
        onClick: this.loadTypesHandler(!isPulled),
      },
    ];

    return (
      <div {...styles.base}>
        <PropList title={'Code Editor'} items={items} />
        <PropList.Hr />
        {elTypes}
        {isPulled && <PropList.Hr />}
        <SidebarDebug />
      </div>
    );
  }

  private renderType(def: t.INsTypeDef) {
    const styles = {
      label: css({
        Flex: 'horizontal-center-center',
      }),
      column: css({
        backgroundColor: COLORS.DARK,
        color: color.format(1),
        PaddingX: 5,
        paddingTop: 1,
        paddingBottom: 1,
        marginRight: 6,
        borderRadius: 2,
        fontSize: 10,
        minWidth: 24,
        textAlign: 'center',
        boxSizing: 'border-box',
      }),
    };

    const columns = def.columns.map((item) => {
      const label = (
        <div {...styles.label}>
          <div {...styles.column}>{item.column}</div>
          <div>{item.prop}</div>
        </div>
      );
      const value = item.type.typename;
      const tooltip = item.default ? item.default.toString() : undefined;
      const clipboard = JSON.stringify(item.type, null, '  ');
      const res: IPropListItem = { label, value, tooltip, clipboard };
      return res;
    });

    const items = [{ label: 'uri', value: def.uri }, ...columns];

    return <PropList title={def.typename} items={items} />;
  }

  /**
   * Handlers
   */
  private loadTypesHandler = (pull?: boolean) => {
    return () => {
      const ctx = this.context;
      if (pull) {
        const uri = this.store.uri;
        ctx.fire({ type: 'APP:IDE/types/pull', payload: { uri } });
      } else {
        ctx.fire({ type: 'APP:IDE/types/unload', payload: {} });
      }
    };
  };
}
