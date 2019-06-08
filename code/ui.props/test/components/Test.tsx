import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as cli from '../cli';
import { color, css, CommandShell, t, ObjectView, COLORS, Props } from '../common';

export type ITestProps = {};

export class Test extends React.PureComponent<ITestProps, t.ITestState> {
  public state: t.ITestState = { data: { ...cli.SAMPLE } };
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<t.ITestState>>();
  private cli: t.ICommandState = cli.init({ state$: this.state$ });

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    const { theme = 'DARK' } = this.state;
    const isDark = theme === 'DARK';
    const styles = {
      base: css({
        flex: 1,
        backgroundColor: isDark ? COLORS.DARK : undefined,
        Flex: 'horizontal-stretch-stretch',
        borderBottom: `solid 1px ${color.format(0.15)}`,
      }),
      left: css({ flex: 1, Flex: 'center-center' }),
      inner: css({
        position: 'relative',
        border: `solid 1px ${color.format(isDark ? 0.2 : -0.15)}`,
        height: '85%',
        width: 300,
      }),
      props: css({ Absolute: 0 }),
      right: css({
        Scroll: true,
        borderLeft: `solid 1px ${color.format(isDark ? 0.15 : -0.15)}`,
        width: 300,
        padding: 8,
      }),
    };

    return (
      <CommandShell cli={this.cli} tree={{}} localStorage={true}>
        <div {...styles.base}>
          <div {...styles.left}>
            <div {...styles.inner}>
              <Props
                data={this.state.data}
                style={styles.props}
                theme={theme}
                onChange={this.handleChange}
                renderValue={this.valueFactory}
              />
            </div>
          </div>
          <div {...styles.right}>
            <ObjectView name={'state'} data={this.state} theme={theme} expandLevel={5} />
          </div>
        </div>
      </CommandShell>
    );
  }

  private valueFactory: t.PropValueFactory = e => {
    if (e.path === 'custom') {
      const styles = {
        base: css({
          flex: 1,
          backgroundColor: 'rgba(255, 0, 0, 0.2)',
          padding: 3,
          border: `dashed 1px ${color.format(0.2)}`,
          borderRadius: 4,
          Flex: 'center-center',
        }),
      };
      const el = (
        <div {...styles.base}>
          <div>Custom</div>
        </div>
      );

      return { el, underline: { color: '#65D9EF', style: 'dashed' } };
    }

    if (e.path === 'custom-props') {
      return { underline: { color: '#F93B7E', style: 'dashed' } };
    }

    return;
  };

  /**
   * [Handlers]
   */

  private handleChange = (e: t.IPropsChange) => {
    const data = e.data.to;
    this.state$.next({ data });
  };
}
