import { copyToClipboard } from '@platform/react/lib';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { defaultValue, color, COLORS, css, CssValue, t, time } from '../../common';
import { Icons } from '../Icons';
import { Switch } from '../primitives';

export type IPropListItemValueProps = {
  data: t.IPropListItem;
  isFirst?: boolean;
  isLast?: boolean;
  style?: CssValue;
};
export type IPropListItemValueState = {
  isOver?: boolean;
  message?: React.ReactNode;
};

export class PropListItemValue extends React.PureComponent<
  IPropListItemValueProps,
  IPropListItemValueState
> {
  public state: IPropListItemValueState = {};
  private state$ = new Subject<Partial<IPropListItemValueState>>();
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
  public get data() {
    return this.props.data;
  }

  public get value() {
    return this.data.value;
  }

  public get isString() {
    return typeof this.value === 'string';
  }

  public get isNumber() {
    return typeof this.value === 'number';
  }

  public get isSimple() {
    return this.isString || this.isNumber;
  }

  public get isCopyable() {
    const { data } = this.props;
    const { onClick } = data;
    return !onClick && this.isSimple;
  }

  public get clipboard() {
    if (this.props.data.clipboard) {
      return this.props.data.clipboard;
    }
    if (this.isSimple) {
      return this.value?.toString() || '';
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
        title={this.props.data.tooltip}
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

    if (typeof value === 'boolean') {
      return this.renderBoolean(value);
    }
    if (typeof value === 'string' || typeof value === 'number') {
      return this.renderSimple(value);
    }
    return null;
  }

  private renderBoolean(value: boolean) {
    return <Switch height={16} value={value} />;
  }

  private renderSimple(value: string | number) {
    const { isOver, message } = this.state;

    const textColor = message ? color.format(-0.3) : isOver ? COLORS.BLUE : COLORS.DARK;

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
        cursor: 'pointer',
        textAlign: 'right',
      }),
    };

    const text = message ? message : value;

    return (
      <div {...css(styles.base)}>
        <div {...styles.text}>{text}</div>
        {this.isCopyable && this.renderCopyIcon()}
      </div>
    );
  }

  private renderCopyIcon() {
    const { isOver, message } = this.state;
    if (!isOver || message) {
      return null;
    }
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
    const data = this.data;
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
