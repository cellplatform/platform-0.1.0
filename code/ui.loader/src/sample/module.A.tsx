import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { COLORS, css, GlamorValue } from '../common';
import { loader } from './loader';

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec quam lorem. Praesent fermentum, augue ut porta varius, eros nisl euismod ante, ac suscipit elit libero nec dolor. Morbi magna enim, molestie non arcu id, varius sollicitudin neque. In sed quam mauris. Aenean mi nisl, elementum non arcu quis, ultrices tincidunt augue. Vivamus fermentum iaculis tellus finibus porttitor. Nulla eu purus id dolor auctor suscipit. Integer lacinia sapien at ante tempus volutpat.';

export type IFooProps = { style?: GlamorValue };
export type IFooState = {
  more?: string[];
};

export class Foo extends React.PureComponent<IFooProps, IFooState> {
  public state: IFooState = {};
  private state$ = new Subject<Partial<IFooState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IFooProps) {
    super(props);
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
    const res = await loader.load<string[]>('B');
    if (res.result) {
      const more = [...(this.state.more || []), ...res.result];
      this.state$.next({ more });
    }
  };
}
