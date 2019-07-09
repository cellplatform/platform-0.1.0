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
  Button,
  IIcon,
  t,
  TextInput,
  util,
  value as valueUtil,
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
  parentNode: t.IPropNode;
  node: t.IPropNode;
  renderValue?: t.PropValueFactory;
  isDeletable?: boolean;
  events$: Subject<t.PropsEvent>;
  style?: GlamorValue;
};

export type IPropEditorState = {
  value?: t.PropValue;
  isOver?: boolean;
};

export class PropEditor extends React.PureComponent<IPropEditorProps, IPropEditorState> {
  public state: IPropEditorState = {};
  private state$ = new Subject<Partial<IPropEditorState>>();
  private unmounted$ = new Subject<{}>();
  private didUpdate$ = new Subject();
  private value$ = new Subject<t.TextInputEvent>();

  private elValueInput!: TextInput;
  private elValueInputRef = (ref: TextInput) => (this.elValueInput = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));
    this.setValue(this.value);

    const value$ = this.value$.pipe(takeUntil(this.unmounted$));

    const keydown$ = value$.pipe(
      filter(e => e.type === 'TEXT_INPUT/keypress'),
      map(e => e.payload as t.ITextInputKeypress),
      filter(e => e.isPressed),
    );

    const upDownKey$ = keydown$.pipe(filter(e => ['ArrowUp', 'ArrowDown'].includes(e.key)));

    upDownKey$.pipe(filter(e => this.type === 'boolean')).subscribe(e => {
      e.event.preventDefault();
      const to = (!valueUtil.toBool(this.value)).toString();
      this.change({ to });
    });

    upDownKey$.pipe(filter(e => this.type === 'number')).subscribe(e => {
      e.event.preventDefault();
      const value = valueUtil.toNumber(this.value);
      const to = (e.key === 'ArrowUp' ? value + 1 : value - 1).toString();
      this.change({ to });
    });

    /**
     * Value [changing] by user.
     * Prevent input if not valid.
     */
    value$
      .pipe(
        filter(e => e.type === 'TEXT_INPUT/changing'),
        map(e => e.payload as t.ITextInputChanging),
      )
      .subscribe(e => {
        const type = this.type;
        if (type === 'boolean') {
          e.cancel();
          if (e.char.toUpperCase() === 'T') {
            this.change({ to: 'true' });
          }
          if (e.char.toUpperCase() === 'F') {
            this.change({ to: 'false' });
          }
        }
      });

    /**
     * Value [changed] by user input.
     */
    value$
      .pipe(
        filter(e => e.type === 'TEXT_INPUT/changed'),
        map(e => e.payload as t.ITextInputChanged),
      )
      .subscribe(e => {
        this.change({ to: e.to });
      });

    /**
     * Value changed progrmatically via property.
     */
    this.didUpdate$
      .pipe(
        takeUntil(this.unmounted$),
        debounceTime(0),
        filter(e => this.value !== this.state.value),
      )
      .subscribe(e => this.setValue(this.value));
  }

  public componentDidUpdate(prev: IPropEditorProps) {
    const value = this.value;
    if (value !== this.state.value) {
      this.didUpdate$.next();
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

  public get id() {
    return this.props.node.id;
  }

  public get nodeData() {
    return this.props.node.data as t.IPropNodeData;
  }

  public get path() {
    const node = this.props.node;
    return node.id.slice(node.id.indexOf('.') + 1);
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
    return util.toType(this.value);
  }

  public get isScalar() {
    const type = this.type;
    return ['object', 'array', 'function'].includes(type);
  }

  public get parentType() {
    const { parentNode } = this.props;
    const data = parentNode ? parentNode.data : undefined;
    const value = data ? data.value : undefined;
    return util.toType(value);
  }

  private get lens() {
    const path = this.nodeData.path;
    const parts = path
      .split('.')
      .slice(1)
      .map(key => {
        if (key.startsWith('[') && key.endsWith(']')) {
          const index = key.replace(/^\[/, '').replace(/\]$/, '');
          if (valueUtil.isNumeric(index)) {
            return valueUtil.toNumber(index);
          }
        }
        return key;
      });
    return R.lensPath(parts);
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

  private fire(e: t.PropsEvent) {
    this.props.events$.next(e);
  }

  private setValue(value?: t.PropValue) {
    value = value === false ? 'false' : value;
    this.state$.next({ value });
  }

  private change: t.PropValueFactoryArgs['change'] = args => {
    const data = this.nodeData;
    const key = data.key;
    const { path, action = 'CHANGE' } = data;

    const fromValue = data.value;
    const value = { from: fromValue, to: valueUtil.toType(args.to) as t.PropValue };

    const root = this.props.rootData;
    const from = Array.isArray(root) ? [...root] : { ...this.props.rootData };
    const lens = this.lens;
    const to = R.set(lens, value.to, from);

    const payload: t.IPropsChange = {
      action,
      path,
      key,
      value,
      data: { from, to },
    };

    this.setValue(value.to);
    this.fire({ type: 'PROPS/changed', payload });
  };

  private onFocus: t.PropValueFactoryArgs['onFocus'] = isFocused => {
    const path = this.path;
    this.fire({ type: 'PROPS/focus', payload: { path, isFocused } });
  };

  /**
   * [Render]
   */
  public render() {
    const isScalar = this.isScalar;
    const isArray = this.parentType === 'array';
    const data = this.nodeData;
    const value = this.renderValue();
    const elValue = value ? value.el : undefined;
    const underline = (value && value.underline) || {
      color: isScalar || data.action === 'INSERT' ? 0.1 : 0.6,
      style: 'solid',
    };

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
        flex: !isArray ? 1 : undefined,
        width: isArray ? 30 : undefined,
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
        borderBottom: `${underline.style} 1px ${color.format(underline.color)}`,
      }),
    };

    return (
      <div
        {...css(styles.base, this.props.style)}
        onMouseEnter={this.overDeleteHandler(true)}
        onMouseLeave={this.overDeleteHandler(false)}
      >
        <div {...css(styles.outer, styles.left)}>
          <div {...styles.ellipsis}>{this.key}</div>
        </div>
        <div {...css(styles.outer, styles.right)}>{elValue}</div>
        {this.renderDelete()}
      </div>
    );
  }

  private renderValue = (): t.PropValueFactoryResponse => {
    const factory = this.props.renderValue;
    const path = this.path;
    const { key, value } = this.nodeData;
    const args: t.PropValueFactoryArgs = {
      path,
      key,
      value,
      type: this.type,
      theme: this.theme,
      change: this.change,
      onFocus: this.onFocus,
    };

    if (factory) {
      const res = factory(args);
      if (res && !res.el) {
        const local = this.valueFactory(args) as t.PropValueFactoryResponse;
        return { ...res, ...local };
      }
      if (res && res.el) {
        return res;
      }
    }

    return this.valueFactory(args) as t.PropValueFactoryResponse;
  };

  private valueFactory: t.PropValueFactory = e => {
    const { type, key, value } = e;

    const done = (el: React.ReactNode) => {
      return { el };
    };

    if (type === 'array' && Array.isArray(value)) {
      const el = this.renderComplex({ icon: Icons.Array, label: `array(${value.length})` });
      return done(el);
    }

    if (type === 'object' && typeof value === 'object') {
      const keys = Object.keys(value as object);
      const label = `object{${keys.length}}`;
      const el = this.renderComplex({ icon: Icons.Object, label });
      return done(el);
    }

    if (type === 'function' && typeof value === 'function') {
      const name = value.name;
      const label = !name || name === key ? 'ƒunction' : `${name}()`;
      const el = this.renderComplex({ icon: Icons.Function, label, italic: true });
      return done(el);
    }

    const el = this.renderValueInput();
    return done(el);
  };

  private renderValueInput = () => {
    const data = this.nodeData;
    const styles = {
      input: css({ flex: 1 }),
    };
    const value = (this.state.value || '').toString();
    const valueColor = this.valueColor;
    return (
      <TextInput
        key={this.props.node.id}
        ref={this.elValueInputRef}
        value={value}
        placeholder={data.action === 'INSERT' ? 'New value' : ''}
        style={styles.input}
        valueStyle={{ ...FONT_STYLE, color: valueColor }}
        placeholderStyle={{
          ...FONT_STYLE,
          color: color.alpha(valueColor, 0.2),
          italic: true,
        }}
        events$={this.value$}
        spellCheck={false}
        autoCapitalize={false}
        autoComplete={false}
        autoCorrect={false}
        onFocus={this.focusHandler(true)}
        onBlur={this.focusHandler(false)}
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
      icon: css({
        position: 'relative',
        top: 1,
        marginRight: 6,
      }),
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

  private renderDelete() {
    if (!this.props.isDeletable) {
      return null;
    }
    const isOver = this.state.isOver;
    const styles = {
      base: css({
        cursor: 'pointer',
        opacity: isOver ? 0.6 : 0,
        transition: `opacity 0.7s`,
      }),
      icon: css({
        position: 'relative',
        top: 2,
        marginLeft: 3,
      }),
    };
    return (
      <Button style={styles.base} onClick={this.handleDeleteClick}>
        <Icons.Delete color={COLORS.WHITE} size={18} style={styles.icon} />
      </Button>
    );
  }

  /**
   * [Handlers]
   */
  private focusHandler = (isFocused: boolean) => {
    return () => {
      this.onFocus(isFocused);
    };
  };

  private overDeleteHandler = (isOverDelete: boolean) => {
    return () => {
      this.state$.next({ isOver: isOverDelete });
    };
  };

  private handleDeleteClick = () => {
    console.log('Delete');
  };
}
