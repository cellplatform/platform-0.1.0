import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css, t, COLORS, shell } from '../common';

// TEMP 🐷
const ROOT: t.ITreeNode = {
  id: 'ROOT',
  props: { label: 'Title' },
  children: [{ id: 'one' }, { id: 'two' }],
};

export const init: t.ShellImportInit = async args => {
  const { shell } = args;
  shell.state.body.el = <ComponentA />;
  shell.state.tree.root = ROOT;
};

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec quam lorem. Praesent fermentum, augue ut porta varius, eros nisl euismod ante, ac suscipit elit libero nec dolor. Morbi magna enim, molestie non arcu id, varius sollicitudin neque. In sed quam mauris. Aenean mi nisl, elementum non arcu quis, ultrices tincidunt augue. Vivamus fermentum iaculis tellus finibus porttitor. Nulla eu purus id dolor auctor suscipit. Integer lacinia sapien at ante tempus volutpat.';

export type IComponentAProps = {};
export type IComponentAState = {};

export class ComponentA extends React.PureComponent<IComponentAProps, IComponentAState> {
  public state: IComponentAState = {};
  private state$ = new Subject<Partial<IComponentAState>>();
  private unmounted$ = new Subject<{}>();

  public static contextType = shell.Context;
  public context!: t.IShellContext;

  /**
   * [Lifecycle]
   */
  constructor(props: IComponentAProps) {
    super(props);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'horizontal-center-center',
      }),
      inner: css({
        position: 'relative',
        width: 820,
        height: '100%',
        boxSizing: 'border-box',
      }),
      version: css({
        Absolute: [8, 0, null, null],
        fontSize: 14,
        opacity: 0.4,
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.inner}>
          <div {...styles.version}>version 0.1.2</div>

          {this.renderPage()}
        </div>
      </div>
    );
  }

  private renderPage() {
    const margin = 70;
    const styles = {
      base: css({
        Absolute: [35, 0, 0, 0],
        border: `solid 1px ${color.format(-0.15)}`,
        borderBottom: 'none',
        backgroundColor: color.format(1),
        borderRadius: '3px 3px 0 0',
        boxSizing: 'border-box',
        boxShadow: `0 0 12px 0 ${color.format(-0.15)}`,
        padding: 40,
        paddingLeft: 90,
      }),
      margin: css({
        Absolute: [0, null, 0, margin],
        borderLeft: `solid 1px #FF257B`,
        opacity: 0.25,
      }),
      header: css({
        borderRadius: '3px 3px 0 0',
        borderBottom: `solid 1px ${color.format(-0.1)}`,
        Absolute: [0, 0, null, 0],
        height: 40,
        backgroundColor: color.format(0.9),
      }),
      body: css({
        marginTop: 30,
      }),
      link: css({
        color: COLORS.BLUE,
        cursor: 'pointer',
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.margin} />
        <div {...css(styles.margin, { left: margin + 2 })} />
        <div {...styles.header}>
          <div />
        </div>
        <div {...styles.body}>
          <p>{LOREM}</p>
          <p>{LOREM}</p>
          <p>{LOREM}</p>
          <div {...styles.link} onClick={this.loadAside}>
            Load sidebar
          </div>
        </div>
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private loadAside = () => {
    this.context.shell.load('B');
  };
}
