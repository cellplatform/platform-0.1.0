import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { color, css, CssValue, t, ui, Module } from '../common';

type V = t.ThreeView;
type T = t.ThreeTarget;
type P = t.ThreeProps;

export type IRootProps = { style?: CssValue };
export type IRootState = t.Object;

export class Root extends React.PureComponent<IRootProps, IRootState> {
  public state: IRootState = {};
  private state$ = new Subject<Partial<IRootState>>();
  private unmounted$ = new Subject();

  public static contextType = Module.Context;
  public context!: t.ThreeContext;

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));

    const ctx = this.context;
    const module = ctx.module;
    const bus = this.bus;
    const fire = Module.fire<P>(bus);

    fire.render({
      module,
      view: 'FOO',
      target: 'PANEL/left',
      data: { title: 'Target Left' },
    });

    fire.render({
      module,
      view: 'FOO',
      target: 'PANEL/right',
      data: { title: 'Target Right' },
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get bus() {
    return this.context.bus;
  }

  public get module() {
    return this.context.module;
  }

  /**
   * [Render]
   */
  public render() {
    const ctx = this.context;
    if (!ctx) {
      return null;
    }

    const styles = {
      base: css({
        flex: 1,
        padding: 50,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }),
      body: css({
        Flex: 'horizontal-start-center',
      }),
      edge: css({
        position: 'relative',
        border: `solid 1px ${color.format(-0.08)}`,
        width: 280,
        padding: 30,
        backgroundColor: color.format(-0.03),
        display: 'flex',
      }),
      left: css({
        height: 150,
      }),
      right: css({}),
      spacer: css({ margin: 30 }),
      frame: css({ flex: 1 }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.body}>
          <div {...css(styles.edge, styles.left)} className={'left-outer'}>
            <ui.ModuleView.Frame
              bus={ctx.bus}
              filter={this.viewFilter}
              target={'PANEL/left'}
              style={styles.frame}
              debug={true}
            />
          </div>
          <div {...styles.spacer} />
          <div {...css(styles.edge, styles.right)} className={'right-outer'}>
            <ui.ModuleView.Frame
              bus={ctx.bus}
              filter={this.viewFilter}
              target={'PANEL/right'}
              style={styles.frame}
              debug={true}
            />
          </div>
        </div>
      </div>
    );
  }

  /**
   * [Handlers]
   */

  private viewFilter: t.ModuleFilterView<V, T> = (e) => {
    const module = this.module;
    return e.view === 'FOO' && (e.module === module.id || module.contains(e.module));
  };
}
