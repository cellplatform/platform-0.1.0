import { copyToClipboard } from '@platform/react/lib';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { defaultValue, color, COLORS, css, CssValue, t, time } from '../../common';
import { Icons } from '../Icons';
import { Switch } from '../../components.ref/button/Switch';

export type PropListItemValueProps = {
  item: t.PropListItem;
  isFirst?: boolean;
  isLast?: boolean;
  defaults?: t.PropListDefaults;
  style?: CssValue;
};
export type PropListItemValueState = {
  isOver?: boolean;
  message?: React.ReactNode;
};

export class PropListItemValue extends React.PureComponent<
  PropListItemValueProps,
  PropListItemValueState
> {
  public state: PropListItemValueState = {};
  private state$ = new Subject<Partial<PropListItemValueState>>();
  private unmounted$ = new Subject<void>();

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get item() {
    return this.props.item;
  }

  public get value(): t.PropListValue {
    const value = this.item.value;
    if (typeof value !== 'object') return { data: value };
    if (React.isValidElement(value)) return { data: value };
    return value as t.PropListValue;
  }

  public get isString() {
    return typeof this.value.data === 'string';
  }

  public get isNumber() {
    return typeof this.value.data === 'number';
  }

  public get isSimple() {
    return this.isString || this.isNumber;
  }

  public get defaults(): t.PropListDefaults {
    return {
      clipboard: true,
      ...this.props.defaults,
    };
  }

  public get isCopyable() {
    const { item } = this.props;
    if (item.onClick) return false;
    if (this.value.clipboard) return true;
    return this.isSimple && this.defaults.clipboard;
  }

  public get clipboard() {
    const { item } = this.props;
    const value = this.value;
    if (value.clipboard) {
      return typeof value.clipboard === 'boolean' ? item.value?.toString() || '' : value.clipboard;
    }
    if (this.isSimple) {
      return value?.data?.toString() || '';
    }
    return undefined;
  }

  /**
   * [Methods]
   */
  private copyText = () => {
    if (this.clipboard) {
      copyToClipboard(this.clipboard);
      this.showMessage('copied');
    }
  };

  public showMessage(message: React.ReactNode, delay?: number) {
    const msec = defaultValue(delay, 1500);
    this.state$.next({ message });
    time.delay(msec, () => this.state$.next({ message: undefined }));
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        flex: 1,
        position: 'relative',
        Flex: 'center-end',
        userSelect: 'none',
      }),
    };
    return (
      <div
        {...styles.base}
        title={this.props.item.tooltip}
        onMouseEnter={this.overHandler(true)}
        onMouseLeave={this.overHandler(false)}
        onClick={this.onClick}
      >
        {this.renderValue()}
      </div>
    );
  }

  private renderValue() {
    const value = this.value;

    if (typeof value.data === 'boolean') {
      return this.renderBoolean(value);
    }
    if (typeof value.data === 'string' || typeof value.data === 'number') {
      return this.renderSimple(value);
    }
    return null;
  }

  private renderBoolean(value: t.PropListValue) {
    return <Switch height={16} value={value.data as boolean} />;
  }

  private renderSimple(value: t.PropListValue) {
    const { isOver, message } = this.state;
    const isActive = isOver && this.isCopyable;
    const isMonospace = value.monospace;
    const textColor = message ? color.format(-0.3) : isActive ? COLORS.BLUE : COLORS.DARK;

    const styles = {
      base: css({
        position: 'relative',
        flex: 1,
        height: 13,
      }),
      text: css({
        Absolute: 0,
        color: textColor,
        width: '100%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        cursor: isActive ? 'pointer' : 'default',
        textAlign: 'right',
        fontFamily: isMonospace ? 'monospace' : undefined,
      }),
    };

    const text = message ? message : value.data;

    return (
      <div {...css(styles.base)}>
        <div {...styles.text}>{text}</div>
        {this.isCopyable && this.renderCopyIcon()}
      </div>
    );
  }

  private renderCopyIcon() {
    const { isOver, message } = this.state;
    if (!isOver || message) return null;

    if (!this.isCopyable) return null;

    const styles = {
      base: css({
        Absolute: [2, -12, null, null],
        opacity: 0.8,
      }),
    };
    return <Icons.Copy style={styles.base} color={COLORS.DARK} size={10} />;
  }

  /**
   * [Handlers]
   */

  private overHandler = (isOver: boolean) => {
    return () => this.state$.next({ isOver });
  };

  private onClick = () => {
    const data = this.item;
    const { onClick } = data;
    if (onClick) {
      onClick({
        data,
        message: (message: React.ReactNode, delay?: number) => this.showMessage(message, delay),
      });
    }
    if (this.isCopyable) {
      this.copyText();
    }
  };
}
