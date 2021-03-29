import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue, t, ui, onStateChanged } from '../../common';
import { IPropListItem, PropList } from '../primitives';
import { SidebarDebug } from './Sidebar.debug';
import { SidebarTypeDef } from './Sidebar.typeDef';

export type ISidebarProps = { style?: CssValue };
export type ISidebarState = t.Object;

export class Sidebar extends React.PureComponent<ISidebarProps, ISidebarState> {
  public state: ISidebarState = {};
  private state$ = new Subject<Partial<ISidebarState>>();
  private unmounted$ = new Subject<void>();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    const ctx = this.context;
    const changes = onStateChanged(ctx.bus.event$, this.unmounted$);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));

    changes
      .on('APP:IDE/types/data', 'APP:IDE/types/clear')
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
        paddingBottom: 80,
        Scroll: true,
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
    const styles = {
      base: css({}),
    };

    const state = this.store;
    const typesystem = state.typesystem;
    const isPulled = Boolean(typesystem);
    const typeDefs = typesystem?.defs || [];

    const elTypes = typeDefs.map((typeDef, i) => {
      return <SidebarTypeDef key={i} typeDef={typeDef} />;
    });

    const items: IPropListItem[] = [{ label: 'language', value: 'typescript' }];

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
}
