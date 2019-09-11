import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { COLORS, Button, color, css, Hr, ITextInputProps, log, t, TextInput } from '../common';
import { TestText } from './Test.Text';

export type ITestInputProps = { value?: string };
export type ITestInputState = { value?: string };

export class TestInput extends React.PureComponent<ITestInputProps, ITestInputState> {
  public state: ITestInputState = {};
  private state$ = new Subject<Partial<ITestInputState>>();
  private unmounted$ = new Subject<{}>();
  private input$ = new Subject<t.TextInputEvent>();

  public inputs: TextInput[] = [];
  private inputRef = (ref: TextInput) => (this.inputs = ref ? [...this.inputs, ref] : this.inputs);

  /**
   * [Lifecycle]
   */
  constructor(props: ITestInputProps) {
    super(props);
  }

  public componentDidMount() {
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

    // Finish up.
    this.updateState();
  }

  public componentDidUpdate(prev: ITextInputProps) {
    const { value } = this.props;
    if (value !== prev.value) {
      this.updateState();
    }
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Methods]
   */
  public updateState() {
    const { value } = this.props;
    this.state$.next({ value });
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        // userSelect: 'none',
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
          <this.Input focusOnLoad={true} placeholder={'placeholder'} />
          <this.Input placeholder={'read-only'} isReadOnly={true} />
          <this.Input maxLength={5} placeholder={'max-length: 5'} />
        </div>
        <div {...styles.dark}>
          <this.Input
            valueStyle={{ color: COLORS.WHITE }}
            placeholder={'placeholder'}
            placeholderStyle={{ color: color.format(0.2), italic: true }}
          />
          <this.Input
            isEnabled={false}
            valueStyle={{ color: 1, disabledColor: 1 }}
            disabledOpacity={0.2}
            placeholder={'disabled'}
            placeholderStyle={{ color: color.format(0.2), italic: true }}
          />
        </div>
      </div>
    );
  }

  private Input = (props: Partial<ITextInputProps>) => {
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
  };
}
