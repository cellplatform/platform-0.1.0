import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IIcon, COLORS, css, color, GlamorValue, TextInput, t, constants, Icons } from '../common';

const { MONOSPACE } = constants;
const FONT_STYLE = {
  fontSize: 12,
  color: COLORS.WHITE,
  fontFamily: MONOSPACE.FAMILY,
};

export type IPropEditorProps = {
  theme: t.PropsTheme;
  node: t.IPropNode;
  style?: GlamorValue;
};
export type IPropEditorState = {};

export class PropEditor extends React.PureComponent<IPropEditorProps, IPropEditorState> {
  public state: IPropEditorState = {};
  private state$ = new Subject<Partial<IPropEditorState>>();
  private unmounted$ = new Subject();

  private valueInput!: TextInput;
  private elValueInputRef = (ref: TextInput) => (this.valueInput = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get isFocused() {
    const input = this.valueInput;
    return input ? input.isFocused : false;
  }

  public get key() {
    const { node } = this.props;
    return node.data ? node.data.key : 'UNKNOWN';
  }

  public get value() {
    const { node } = this.props;
    return node.data ? node.data.value : 'UNKNOWN';
  }

  public get valueType(): 'OBJECT' | 'ARRAY' | 'SIMPLE' {
    const value = this.value;
    if (Array.isArray(value)) {
      return 'ARRAY';
    }
    if (typeof value === 'object') {
      return 'OBJECT';
    }
    return 'SIMPLE';
  }

  /**
   * [Methods]
   */
  public focus() {
    if (this.valueInput) {
      this.valueInput.focus();
    }
    return this;
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        flex: 1,
        display: 'flex',
        Flex: 'horizontal-start-stretch',
        fontFamily: MONOSPACE.FAMILY,
        ...FONT_STYLE,
      }),
      outer: css({
        Flex: 'center-start',
        height: 22,
        paddingBottom: 2,
      }),
      left: css({
        flex: 1,
        marginRight: 10,
        color: color.format(0.4),
        position: 'relative',
        display: 'flex',
        minWidth: 0, // NB: Needed to make ellipsis work. https://css-tricks.com/flexbox-truncated-text/
        borderBottom: `solid 1px ${color.format(0.1)}`,
      }),
      ellipsis: css({
        flex: 1,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }),
      right: css({
        flex: 2,
        borderBottom: `solid 1px ${color.format(0.5)}`,
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...css(styles.outer, styles.left)}>
          <div {...styles.ellipsis}>{this.key}</div>
        </div>
        <div {...css(styles.outer, styles.right)}>{this.renderValue()}</div>
      </div>
    );
  }

  private renderValue = () => {
    const value = this.value;
    const valueType = this.valueType;

    if (valueType === 'OBJECT') {
      return this.renderComplex({ icon: Icons.Object, label: '{ object }' });
    }

    if (valueType === 'ARRAY') {
      return this.renderComplex({ icon: Icons.Array, label: `[ array(${value.length}) ]` });
    }

    return this.renderValueInput();
  };

  private renderValueInput = () => {
    const value = this.value;

    const styles = {
      input: css({ flex: 1 }),
    };

    return (
      <TextInput
        ref={this.elValueInputRef}
        value={value}
        style={styles.input}
        valueStyle={{ ...FONT_STYLE }}
      />
    );
  };

  private renderComplex(props: { label: string; icon: IIcon }) {
    const Icon = props.icon;
    const { label } = props;
    const styles = {
      base: css({
        Flex: 'horizontal-center-start',
        opacity: 0.5,
      }),
      icon: css({ marginRight: 6 }),
    };

    return (
      <div {...styles.base}>
        <Icon size={16} color={COLORS.WHITE} style={styles.icon} />
        {label}
      </div>
    );
  }
}
