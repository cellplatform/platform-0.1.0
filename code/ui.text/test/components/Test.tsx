import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { COLORS, Button, color, css, Hr, ITextInputProps, log, t, TextInput } from '../common';
import { TestText } from './Test.Text';

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec quam lorem. Praesent fermentum, augue ut porta varius, eros nisl euismod ante, ac suscipit elit libero nec dolor. Morbi magna enim, molestie non arcu id, varius sollicitudin neque. In sed quam mauris. Aenean mi nisl, elementum non arcu quis, ultrices tincidunt augue. Vivamus fermentum iaculis tellus finibus porttitor. Nulla eu purus id dolor auctor suscipit. Integer lacinia sapien at ante tempus volutpat.';

export type ITestState = { value?: string };

export class Test extends React.PureComponent<ITestState> {
  public state: ITestState = {};
  private unmounted$ = new Subject<{}>();
  private state$ = new Subject<Partial<ITestState>>();
  private input$ = new Subject<t.TextInputEvent>();

  private inputs: TextInput[] = [];
  private inputRef = (ref: TextInput) => (this.inputs = ref ? [...this.inputs, ref] : this.inputs);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const input$ = this.input$.pipe(takeUntil(this.unmounted$));
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));

    input$.subscribe(e => {
      log.info('🌳', e);
    });

    input$
      .pipe(
        filter(e => e.type === 'TEXT_INPUT/changing'),
        map(e => e.payload as t.ITextInputChanging),
      )
      .subscribe(e => {
        // e.cancel();
      });

    input$
      .pipe(
        filter(e => e.type === 'TEXT_INPUT/changed'),
        map(e => e.payload as t.ITextInputChanged),
      )
      .subscribe(e => {
        this.state$.next({ value: e.to });
      });
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
          {this.button('value: long', () => this.state$.next({ value: LOREM }))}
          <Hr margin={5} />
          {this.button('focus', () => this.inputs[0].focus())}
          {this.button('selectAll', () => this.inputs[0].selectAll().focus())}
          {this.button('cursorToStart', () => this.inputs[0].cursorToStart().focus())}
          {this.button('cursorToEnd', () => this.inputs[0].cursorToEnd().focus())}
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
      dark: css({
        boxSizing: 'border-box',
        backgroundColor: COLORS.DARK,
        padding: 15,
        marginTop: 20,
      }),
    };
    return (
      <div {...styles.base}>
        <div>
          {this.renderInput({ focusOnLoad: true })}
          {this.renderInput({ maxLength: 5, placeholder: 'maxLength: 5' })}
        </div>
        <div {...styles.dark}>
          {this.renderInput({
            valueStyle: { color: COLORS.WHITE },
            placeholderStyle: { color: color.format(0.2), italic: true },
          })}
          {this.renderInput({
            isEnabled: false,
            valueStyle: { color: 1, disabledColor: 1 },
            disabledOpacity: 0.2,
            placeholderStyle: { color: color.format(0.2), italic: true },
          })}
        </div>
        <TestText />
      </div>
    );
  }

  private renderInput(props: Partial<ITextInputProps>) {
    const styles = {
      base: css({
        marginBottom: 20,
        ':last-child': { marginBottom: 0 },
      }),
    };
    return (
      <div {...styles.base}>
        <TextInput
          ref={this.inputRef}
          value={this.state.value}
          valueStyle={{ ...props.valueStyle }}
          placeholder={'TextInput'}
          placeholderStyle={{ color: color.format(-0.2), ...props.placeholderStyle }}
          events$={this.input$}
          {...props}
        />
      </div>
    );
  }
}
