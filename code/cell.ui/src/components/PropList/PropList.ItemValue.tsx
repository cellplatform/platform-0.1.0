import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, time, COLORS, css, CssValue, t } from '../../common';
import { Icons } from '../Icons';
import { Switch } from '../primitives';

export type IPropListItemValueProps = {
  data: t.IPropListItem;
  isFirst?: boolean;
  isLast?: boolean;
  style?: CssValue;
};
export type IPropListItemValueState = { isOver?: boolean; isCopied?: boolean };

export class PropListItemValue extends React.PureComponent<
  IPropListItemValueProps,
  IPropListItemValueState
> {
  public state: IPropListItemValueState = {};
  private state$ = new Subject<Partial<IPropListItemValueState>>();
  private unmounted$ = new Subject<{}>();

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
  public get value() {
    return this.props.data.value;
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
      }),
    };
    return (
      <div
        {...styles.base}
        title={this.props.data.tooltip}
        onMouseEnter={this.overHandler(true)}
        onMouseLeave={this.overHandler(false)}
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
    if (typeof value === 'string') {
      return this.renderString(value);
    }
    return null;
  }

  private renderBoolean(value: boolean) {
    return <Switch height={16} value={value} />;
  }

  private renderString(value: string) {
    const { isOver, isCopied } = this.state;

    const textColor = isCopied ? color.format(-0.3) : isOver ? COLORS.BLUE : COLORS.DARK;

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
      input: css({
        Absolute: [-90000, -90000, null, null],
      }),
    };

    const tooltip = isOver ? `Copy: "${value}"` : '';
    const text = isCopied ? 'copied to clipboard' : value;
    const clipboard = this.props.data.clipboard || value;

    return (
      <div {...css(styles.base)} title={tooltip}>
        <input
          {...styles.input}
          ref={this.elTextRef}
          type={'text'}
          value={clipboard}
          readOnly={true}
        />
        <div {...styles.text} onClick={this.copyText}>
          {text}
        </div>
        {this.renderCopyIcon()}
      </div>
    );
  }

  private renderCopyIcon() {
    const { isOver, isCopied } = this.state;

    if (!isOver && !isCopied) {
      return null;
    }

    const styles = {
      base: css({
        Absolute: isCopied ? [-1, -14, null, null] : [2, -12, null, null],
        opacity: 0.8,
      }),
    };
    const Icon = isCopied ? Icons.Tick : Icons.Copy;
    const iconSize = isCopied ? 14 : 10;
    const iconColor = isCopied ? COLORS.GREEN : COLORS.DARK;
    return <Icon style={styles.base} color={iconColor} size={iconSize} />;
  }

  private elText!: HTMLInputElement;
  private elTextRef = (ref: HTMLInputElement) => (this.elText = ref);

  /**
   * [Handlers]
   */
  private overHandler = (isOver: boolean) => {
    return () => this.state$.next({ isOver });
  };

  private copyText = () => {
    this.elText.select();
    document.execCommand('copy');

    this.state$.next({ isCopied: true });
    time.delay(1500, () => this.state$.next({ isCopied: false }));
  };
}
