import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Button, color, css, Hr } from '../common';
import { TestInput } from './Test.Input';
import { TestText } from './Test.Text';

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec quam lorem. Praesent fermentum, augue ut porta varius, eros nisl euismod ante, ac suscipit elit libero nec dolor. Morbi magna enim, molestie non arcu id, varius sollicitudin neque. In sed quam mauris. Aenean mi nisl, elementum non arcu quis, ultrices tincidunt augue. Vivamus fermentum iaculis tellus finibus porttitor. Nulla eu purus id dolor auctor suscipit. Integer lacinia sapien at ante tempus volutpat.';

export type ITestState = { value?: string };

export class Test extends React.PureComponent<{}, ITestState> {
  public state: ITestState = {};
  private unmounted$ = new Subject<{}>();
  private state$ = new Subject<Partial<ITestState>>();

  private inputs!: TestInput;
  private inputsRef = (ref: TestInput) => (this.inputs = ref);

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Methods]
   */
  public input(index: number) {
    return this.inputs.inputs[index];
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
        display: 'flex',
      }),
      left: css({
        width: 180,
        backgroundColor: color.format(-0.04),
        borderRight: `solid 1px ${color.format(-0.1)}`,
        fontSize: 13,
        padding: 10,
        lineHeight: 1.8,
      }),
      right: css({
        flex: 1,
        position: 'relative',
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.left}>
          {this.button('value: <empty>', () => this.state$.next({ value: '' }))}
          {this.button('value: short', () => this.state$.next({ value: 'hello' }))}
          {this.button('value: long', () => this.state$.next({ value: LOREM }))}
          <Hr margin={5} />
          {this.button('focus', () => this.input(0).focus())}
          {this.button('selectAll', () =>
            this.input(0)
              .selectAll()
              .focus(),
          )}
          {this.button('cursorToStart', () =>
            this.input(0)
              .cursorToStart()
              .focus(),
          )}
          {this.button('cursorToEnd', () =>
            this.input(0)
              .cursorToEnd()
              .focus(),
          )}
        </div>
        <div {...styles.right}>{this.renderMain()}</div>
      </div>
    );
  }

  private button(title: string, handler?: () => void) {
    return <Button label={title} onClick={handler} block={true} />;
  }

  private renderMain() {
    const styles = {
      base: css({
        Absolute: 0,
        padding: 30,
        Scroll: true,
      }),
    };
    return (
      <div {...styles.base}>
        <TestInput ref={this.inputsRef} value={this.state.value} />
        <TestText />
      </div>
    );
  }
}
