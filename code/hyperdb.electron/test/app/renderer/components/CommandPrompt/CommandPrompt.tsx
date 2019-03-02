import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { value, events, constants, css, color, GlamorValue, COLORS } from '../../common';
import { TextInput, TextInputChangeEvent } from '../primitives';
import { InvokeCommandEventHandler } from './types';

const { MONOSPACE } = constants.FONT;
const { CLI } = COLORS;
const FONT_SIZE = 14;

export type ICommandPromptProps = {
  focusOnKeypress?: boolean;
  style?: GlamorValue;
  onInvoke?: InvokeCommandEventHandler;
};
export type ICommandPromptState = {
  input?: string;
};

export class CommandPrompt extends React.PureComponent<ICommandPromptProps, ICommandPromptState> {
  public state: ICommandPromptState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<ICommandPromptState>();

  private elInput: TextInput | undefined;
  private elInputRef = (ref: TextInput) => (this.elInput = ref);

  /**
   * [Lifecycle]
   */

  constructor(props: ICommandPromptProps) {
    super(props);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));

    const keypress$ = events.keyPress$.pipe(takeUntil(this.unmounted$));
    keypress$
      // Focus on any keypress.
      .pipe(filter(e => this.props.focusOnKeypress))
      .subscribe(e => this.focus());

    keypress$
      // Invoke on [Enter]
      .pipe(filter(e => e.key === 'Enter'))
      .subscribe(e => this.fireInvoke());

    keypress$
      // Clear on CMD+K
      .pipe(filter(e => e.key === 'k' && e.metaKey))
      .subscribe(e => (this.input = undefined));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */
  public get input() {
    const { input = '' } = this.state;
    return input;
  }

  public set input(value: string | undefined) {
    this.state$.next({ input: value });
  }

  /**
   * [Methods]
   */
  public focus() {
    if (this.elInput) {
      this.elInput.focus();
    }
  }

  /**
   * [Render]
   */

  public render() {
    const styles = {
      base: css({
        position: 'relative',
        boxSizing: 'border-box',
        flex: 1,
        backgroundColor: COLORS.DARK,
        color: COLORS.WHITE,
        height: 32,
        fontSize: FONT_SIZE,
        Flex: 'horizontal-center-start',
        fontFamily: MONOSPACE.FAMILY,
      }),
      prefix: css({
        color: CLI.MAGENTA,
        userSelect: 'none',
        marginLeft: 10,
        marginRight: 5,
        fontWeight: 600,
      }),
      textbox: css({
        flex: 1,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.prefix}>{'>'}</div>
        <TextInput
          ref={this.elInputRef}
          style={styles.textbox}
          onChange={this.handleChange}
          value={this.input}
          valueStyle={{
            color: color.format(0.9),
            fontFamily: MONOSPACE.FAMILY,
            fontWeight: 'BOLD',
          }}
          placeholder={'command'}
          placeholderStyle={{ color: color.format(0.2) }}
        />
      </div>
    );
  }

  /**
   * [Handlers]
   */

  private fireInvoke = () => {
    const input = this.input.trim();
    const { onInvoke } = this.props;
    if (onInvoke && input) {
      onInvoke({ input });
    }
  };

  private handleChange = async (e: TextInputChangeEvent) => {
    this.input = e.to;
  };
}
