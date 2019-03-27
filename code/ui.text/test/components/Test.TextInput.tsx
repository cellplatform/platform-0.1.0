import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Hr, css, color, GlamorValue, Button, TextInput, TextInputChangeEvent } from '../common';

export type ITestTextInputProps = { style?: GlamorValue };
export type ITestTextInputState = {
  value?: string;
};

export class TestTextInput extends React.PureComponent<ITestTextInputProps, ITestTextInputState> {
  public state: ITestTextInputState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestTextInputState>>();

  private input!: TextInput;
  private inputRef = (ref: TextInput) => (this.input = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
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
          <Hr margin={5} />
          {this.button('focus', () => this.input.focus())}
          {this.button('select', () => this.input.select())}
        </div>
        <div {...styles.right}>{this.renderInput()}</div>
      </div>
    );
  }

  private button(title: string, handler?: () => void) {
    return <Button label={title} onClick={handler} block={true} />;
  }

  private renderInput() {
    const styles = {
      base: css({ padding: 30 }),
    };
    return (
      <div {...styles.base}>
        <TextInput
          ref={this.inputRef}
          value={this.state.value}
          focusOnLoad={true}
          placeholder={'Placeholder'}
          placeholderStyle={{ color: color.format(-0.2) }}
          onChange={this.handleChange}
        />
      </div>
    );
  }

  /**
   * [Handlers]
   */

  private handleChange = (e: TextInputChangeEvent) => {
    this.state$.next({ value: e.to });
  };
}
