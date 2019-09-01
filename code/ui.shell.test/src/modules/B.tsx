import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue, t } from '../common';

export const init: t.ShellImportInit = async args => {
  const { shell } = args;
  const sidebar = shell.state.sidebar;
  sidebar.el = <ComponentB />;
  sidebar.background = '#EA4E7E';
  // sidebar.background = { color: '#C3688C', fadeSpeed: 3500 };
};

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec quam lorem. Praesent fermentum, augue ut porta varius, eros nisl euismod ante, ac suscipit elit libero nec dolor. Morbi magna enim, molestie non arcu id, varius sollicitudin neque. In sed quam mauris. Aenean mi nisl, elementum non arcu quis, ultrices tincidunt augue. Vivamus fermentum iaculis tellus finibus porttitor. Nulla eu purus id dolor auctor suscipit. Integer lacinia sapien at ante tempus volutpat.';

export type IComponentBProps = { style?: GlamorValue };
export type IComponentBState = {};

export class ComponentB extends React.PureComponent<IComponentBProps, IComponentBState> {
  public state: IComponentBState = {};
  private state$ = new Subject<Partial<IComponentBState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IComponentBProps) {
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
        color: 'white',
        padding: 12,
        paddingTop: 20,
        fontSize: 14,
        Scroll: true,
      }),
      p: css({
        lineHeight: '1.3em',
        marginBottom: 25,
      }),
    };
    const paras = Array.from({ length: 30 }).map((v, i) => (
      <p key={i} {...styles.p}>
        {LOREM}
      </p>
    ));
    return <div {...css(styles.base, this.props.style)}>{paras}</div>;
  }
}
