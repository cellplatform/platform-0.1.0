import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IIcon, COLORS, css, color, GlamorValue, TextInput, t, constants, Icons } from '../common';
import { themes } from '../../theme';

type ValueType =
  | 'object'
  | 'array'
  | 'string'
  | 'boolean'
  | 'number'
  | 'null'
  | 'undefined'
  | 'function';

const { MONOSPACE } = constants;
const FONT_STYLE = {
  fontSize: 12,
  color: COLORS.WHITE,
  fontFamily: MONOSPACE.FAMILY,
};

export type IPropEditorProps = {
  theme: t.PropsTheme;
  node: t.IPropNode;
  events$: Subject<t.PropsEvent>;
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
  public get theme() {
    return themes[this.props.theme];
  }

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

  public get valueType(): ValueType {
    const value = this.value;
    if (value === null) {
      return 'null';
    }
    if (value === 'undefined') {
      return 'undefined';
    }
    if (Array.isArray(value)) {
      return 'array';
    }
    const type = typeof value;
    if (type === 'object') {
      return 'object';
    }
    if (type === 'number' || type === 'bigint') {
      return 'number';
    }
    if (type === 'boolean') {
      return 'boolean';
    }
    if (type === 'function') {
      return 'function';
    }
    if (type === 'string') {
      return 'string';
    }
    throw new Error(`Value type '${typeof value}' not supported.`);
  }

  public get isScalar() {
    const type = this.valueType;
    return ['object', 'array', 'function'].includes(type);
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
    const isScalar = this.isScalar;

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
        borderBottom: `solid 1px ${color.format(isScalar ? 0.1 : 0.6)}`,
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
    const key = this.key;
    const value = this.value;
    const valueType = this.valueType;

    if (valueType === 'object') {
      return this.renderComplex({ icon: Icons.Object, label: '{ object }' });
    }

    if (valueType === 'array') {
      return this.renderComplex({ icon: Icons.Array, label: `array(${value.length})` });
    }

    if (valueType === 'function') {
      const name = value.name;
      const label = name === key ? 'ƒunction' : `${name}()`;
      return this.renderComplex({ icon: Icons.Function, label, italic: true });
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

  private renderComplex(args: { label: string; icon: IIcon; italic?: boolean }) {
    const Icon = args.icon;
    const { label } = args;
    const styles = {
      base: css({
        Flex: 'horizontal-center-start',
        opacity: 0.5,
      }),
      icon: css({ marginRight: 6 }),
      label: css({
        fontStyle: args.italic ? 'italic' : undefined,
      }),
    };

    return (
      <div {...styles.base}>
        <Icon size={16} color={COLORS.WHITE} style={styles.icon} />
        <span {...styles.label}>{label}</span>
      </div>
    );
  }
}
