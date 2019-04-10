import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  CommandChangeDispatcher,
  containsFocus,
  css,
  events,
  GlamorValue,
  ICommandChange,
  ICommandNamespace,
} from '../../common';
import { TextInput, TextInputChangeEvent } from '../primitives';
import { THEMES } from './themes';
import { ICommandPromptTheme } from './types';

const FONT_SIZE = 14;

export type ICommandPromptInputProps = {
  text?: string;
  namespace?: ICommandNamespace;
  theme?: ICommandPromptTheme | 'DARK';
  placeholder?: string;
  keyPress$?: events.KeypressObservable;
  style?: GlamorValue;
  onChange?: CommandChangeDispatcher;
};
export type ICommandPromptInputState = {};

/**
 * Non-stateful input control for a command.
 */
export class CommandPromptInput extends React.PureComponent<
  ICommandPromptInputProps,
  ICommandPromptInputState
> {
  public static THEMES = THEMES;

  public state: ICommandPromptInputState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<ICommandPromptInputState>();

  private elInput: TextInput | undefined;
  private elInputRef = (ref: TextInput) => (this.elInput = ref);

  /**
   * [Lifecycle]
   */

  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */
  public get text() {
    return this.props.text || '';
  }

  public get isFocused() {
    return containsFocus(this);
  }

  private get theme() {
    const { theme = 'DARK' } = this.props;
    if (typeof theme === 'object') {
      return theme;
    }
    switch (theme) {
      case 'DARK':
        return THEMES.DARK;
    }
    throw new Error(`Theme '${theme}' not supported`);
  }

  /**
   * [Methods]
   */
  public focus = () => {
    if (this.elInput) {
      this.elInput.focus();
    }
  };

  public blur = () => {
    if (this.elInput) {
      this.elInput.blur();
    }
  };

  /**
   * [Render]
   */

  public render() {
    const { placeholder = 'command' } = this.props;
    const ns = this.props.namespace;
    const theme = this.theme;
    const styles = {
      base: css({
        position: 'relative',
        boxSizing: 'border-box',
        flex: 1,
        height: 32,
        fontSize: FONT_SIZE,
        Flex: 'horizontal-center-start',
        paddingLeft: 10,
      }),
      namespace: css({
        color: theme.namespaceColor,
        marginRight: 4,
      }),
      prefix: css({
        color: theme.prefixColor,
        userSelect: 'none',
        marginRight: 5,
        fontWeight: 600,
      }),
      textbox: css({
        flex: 1,
      }),
    };

    const elNamespace = ns && <div {...styles.namespace}>{ns.toString({ delimiter: '.' })}</div>;

    return (
      <div {...css(styles.base, this.props.style)} onClick={this.focus}>
        {elNamespace}
        <div {...styles.prefix}>{'>'}</div>
        <TextInput
          ref={this.elInputRef}
          style={styles.textbox}
          onChange={this.handleChange}
          value={this.text}
          valueStyle={{ color: theme.color }}
          placeholder={placeholder}
          placeholderStyle={{ color: theme.placeholderColor }}
        />
      </div>
    );
  }

  /**
   * [Handlers]
   */

  private fireChange(args: { text?: string; invoked?: boolean; namespace?: boolean }) {
    const { onChange } = this.props;
    if (onChange) {
      const e = CommandPromptInput.toChangeArgs(args);
      onChange(e);
    }
  }

  private handleChange = async (e: TextInputChangeEvent) => {
    this.fireChange({ text: e.to });
  };

  public static toChangeArgs(args: {
    text?: string;
    invoked?: boolean;
    namespace?: boolean;
  }): ICommandChange {
    const { invoked, text = '', namespace } = args;
    return { text, invoked, namespace };
  }
}
