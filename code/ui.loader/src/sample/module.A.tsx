import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { COLORS, css, GlamorValue, t } from './common';
import { loader } from './loader';

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec quam lorem. Praesent fermentum, augue ut porta varius, eros nisl euismod ante, ac suscipit elit libero nec dolor. Morbi magna enim, molestie non arcu id, varius sollicitudin neque. In sed quam mauris. Aenean mi nisl, elementum non arcu quis, ultrices tincidunt augue. Vivamus fermentum iaculis tellus finibus porttitor. Nulla eu purus id dolor auctor suscipit. Integer lacinia sapien at ante tempus volutpat.';

export type IComponentAProps = { style?: GlamorValue };
export type IComponentAState = {
  more?: string[];
};

export class ComponentA extends React.PureComponent<IComponentAProps, IComponentAState> {
  public state: IComponentAState = {};
  private state$ = new Subject<Partial<IComponentAState>>();
  private unmounted$ = new Subject<{}>();

  public static contextType = loader.Context;
  public context!: t.IMyContext;

  /**
   * [Lifecycle]
   */
  constructor(props: IComponentAProps) {
    super(props);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public async componentDidMount() {
    console.group('🌳 ComponentA');
    console.log('A this.context', this.context);
    // console.log('this.loader:', this.context.loader);
    // console.log('this.context.foo:', this.context.foo);
    console.groupEnd();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get loader() {
    return this.context.loader;
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        padding: 30,
        color: COLORS.WHITE,
        cursor: 'pointer',
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)} onClick={this.handleClick}>
        <div>
          <strong>Dynamic load (Module A):</strong>
          <p>{LOREM}</p>
          {(this.state.more || []).map((text, i) => (
            <p key={i}>{text}</p>
          ))}
        </div>
      </div>
    );
  }

  /**
   * [Handlers]
   */

  private handleClick = async () => {
    const res = await this.loader.load<string[]>('B');
    if (res.result) {
      const more = [...(this.state.more || []), ...res.result];
      this.state$.next({ more });
    }
  };
}
