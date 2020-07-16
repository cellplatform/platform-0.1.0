import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { COLORS, color, css, CssValue, ui, t, onStateChanged } from '../../common';
import { IPropListItem, PropList } from '../primitives';

export type ISidebarProps = { style?: CssValue };
export type ISidebarState = t.Object;

export class Sidebar extends React.PureComponent<ISidebarProps, ISidebarState> {
  public state: ISidebarState = {};
  private state$ = new Subject<Partial<ISidebarState>>();
  private unmounted$ = new Subject();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    const ctx = this.context;
    const changes = onStateChanged(ctx.event$, this.unmounted$);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));

    /**
     * Full dataset loaded into state.
     */
    changes.on('APP:SHEET/data').subscribe(() => this.forceUpdate());
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

  public get types() {
    return this.store.data?.types || [];
  }

  /**
   * [Methods]
   */

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
        backgroundColor: color.format(0.6),
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
    const styles = {
      base: css({}),
    };

    const elTypes = this.types.map((type, i) => {
      return <div key={i}>{this.renderType(type)}</div>;
    });

    return <div {...styles.base}>{elTypes}</div>;
  }

  private renderType(type: t.IAppStateType) {
    const styles = {
      base: css({}),
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

    const title: IPropListItem[] = [
      { label: 'typename', value: type.typename },
      { label: 'column names', value: false },
    ];

    const columns = type.columns.map((item) => {
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

    return (
      <div {...styles.base}>
        <PropList title={'Types'} items={title} />
        {/* <PropList.Hr /> */}
        <PropList items={columns} />
      </div>
    );
  }
}
