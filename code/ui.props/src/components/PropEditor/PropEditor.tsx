import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil, debounceTime } from 'rxjs/operators';

import { themes } from '../../theme';
import {
  R,
  color,
  COLORS,
  constants,
  css,
  GlamorValue,
  Icons,
  IIcon,
  t,
  TextInput,
  util,
} from '../common';

const { MONOSPACE } = constants;
const FONT_STYLE = {
  fontSize: 12,
  color: COLORS.WHITE,
  fontFamily: MONOSPACE.FAMILY,
};

export type IPropEditorProps = {
  rootData?: t.PropsData;
  theme: t.PropsTheme;
  node: t.IPropNode;
  events$: Subject<t.PropsEvent>;
  style?: GlamorValue;
};
export type IPropEditorState = {
  value?: string;
};

export class PropEditor extends React.PureComponent<IPropEditorProps, IPropEditorState> {
  public state: IPropEditorState = {};
  private state$ = new Subject<Partial<IPropEditorState>>();
  private unmounted$ = new Subject();
  private didUpdate$ = new Subject<string>();
  private value$ = new Subject<t.TextInputEvent>();

  private elValueInput!: TextInput;
  private elValueInputRef = (ref: TextInput) => (this.elValueInput = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));
    this.state$.next({ value: this.valueString });

    const value$ = this.value$.pipe(takeUntil(this.unmounted$));
    const valueChanged$ = value$.pipe(
      filter(e => e.type === 'TEXT_INPUT/changed'),
      map(e => e.payload as t.ITextInputChanged),
    );

    /**
     * Value changed by user input.
     */
    valueChanged$.subscribe(e => {
      const nodeData = this.nodeData;
      const { path, key } = nodeData;

      const fromValue = nodeData.value;
      const type = util.value(fromValue).type;
      const value = { from: fromValue, to: util.toType(e.to, type) };

      const from = { ...this.props.rootData };
      const lens = R.lensPath(path.split('.').slice(1));
      const to = R.set(lens, value.to, from);

      const payload: t.IPropsChange = {
        path,
        key,
        value,
        data: { from, to },
      };
      this.state$.next({ value: (value.to || '').toString() });
      this.next({ type: 'PROPS/changed', payload });
    });

    /**
     * Value changed progrmatically via property.
     */
    this.didUpdate$
      .pipe(
        takeUntil(this.unmounted$),
        debounceTime(0),
        filter(e => this.valueString !== this.state.value),
      )
      .subscribe(e => this.state$.next({ value: this.valueString }));
  }

  public componentDidUpdate(prev: IPropEditorProps) {
    const value = this.valueString;
    if (value !== this.state.value) {
      this.didUpdate$.next(value);
    }
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
    const input = this.elValueInput;
    return input ? input.isFocused : false;
  }

  public get nodeData() {
    return this.props.node.data as t.IPropNodeData;
  }

  public get key() {
    return this.nodeData.key;
  }

  public get value() {
    return this.nodeData.value;
  }

  public get valueString() {
    return (this.value || '').toString();
  }

  public get valueColor() {
    return util.typeColor(this.type, this.props.theme);
  }

  public get type() {
    return util.value(this.value).type;
  }

  public get isScalar() {
    const type = this.type;
    return ['object', 'array', 'function'].includes(type);
  }

  /**
   * [Methods]
   */
  public focus() {
    if (this.elValueInput) {
      this.elValueInput.focus();
    }
    return this;
  }

  private next(e: t.PropsEvent) {
    this.props.events$.next(e);
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
    const valueType = this.type;

    if (valueType === 'object') {
      return this.renderComplex({ icon: Icons.Object, label: '{ object }' });
    }

    if (valueType === 'array' && Array.isArray(value)) {
      return this.renderComplex({ icon: Icons.Array, label: `array(${value.length})` });
    }

    if (valueType === 'function' && typeof value === 'function') {
      const name = value.name;
      const label = name === key ? 'ƒunction' : `${name}()`;
      return this.renderComplex({ icon: Icons.Function, label, italic: true });
    }

    return this.renderValueInput();
  };

  private renderValueInput = () => {
    const styles = {
      input: css({ flex: 1 }),
    };
    return (
      <TextInput
        key={this.props.node.id}
        ref={this.elValueInputRef}
        value={this.state.value}
        style={styles.input}
        valueStyle={{ ...FONT_STYLE, color: this.valueColor }}
        events$={this.value$}
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
