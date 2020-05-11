import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue, defaultValue } from '../../common';

export type ICardProps = {
  children?: React.ReactNode;
  background?: number | string;
  borderRadius?: number;
  padding?: number;
  margin?: number;
  minWidth?: number;
  minHeight?: number;
  userSelect?: string | boolean;
  style?: CssValue;
};
export type ICardState = {};

export class Card extends React.PureComponent<ICardProps, ICardState> {
  public state: ICardState = {};
  private state$ = new Subject<Partial<ICardState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: ICardProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get userSelect() {
    let value = this.props.userSelect;
    value = value === true ? 'auto' : value;
    value = value === false ? 'none' : value;
    return value as React.CSSProperties['userSelect'];
  }

  /**
   * [Render]
   */
  public render() {
    const background = defaultValue(this.props.background, 1);
    const styles = {
      base: css({
        position: 'relative',
        boxSizing: 'border-box',
        display: 'inline-block',
        border: `solid 1px ${color.format(-0.2)}`,
        borderRadius: defaultValue(this.props.borderRadius, 4),
        background: color.format(background),
        padding: this.props.padding,
        margin: this.props.margin,
        userSelect: this.userSelect,
        minWidth: defaultValue(this.props.minWidth, 10),
        minHeight: defaultValue(this.props.minHeight, 10),
        boxShadow: `0 2px 6px 0 ${color.format(-0.08)}`,
      }),
    };
    return <div {...css(styles.base, this.props.style)}>{this.props.children}</div>;
  }
}
