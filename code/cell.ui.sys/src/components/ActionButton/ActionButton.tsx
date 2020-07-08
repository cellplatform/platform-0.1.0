import { mouse } from '@platform/react';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css, CssValue, COLORS } from '../../common';
import { Button, Card, Icons } from '../primitives';

type OnClick = mouse.IMouseEventProps['onClick'];
export type IActionButtonOption = { label: React.ReactNode; onClick?: OnClick };

export type IActionButtonProps = {
  children?: React.ReactNode;
  options?: IActionButtonOption[];
  style?: CssValue;
  onClick?: OnClick;
};
export type IActionButtonState = {
  isPopupVisible?: boolean;
};

export class ActionButton extends React.PureComponent<IActionButtonProps, IActionButtonState> {
  public state: IActionButtonState = {};
  private state$ = new Subject<Partial<IActionButtonState>>();
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
  public get options() {
    const { options = [] } = this.props;
    return options;
  }

  /**
   * [Render]
   */
  public render() {
    return this.options.length === 0 ? this.renderSimple() : this.renderOptions();
  }

  private renderSimple() {
    const { onClick, children } = this.props;
    return (
      <Button onClick={onClick} style={this.props.style}>
        {children}
      </Button>
    );
  }

  private renderOptions() {
    const { isPopupVisible } = this.state;
    const styles = {
      base: css({
        position: 'relative',
        display: 'inline-block',
      }),
    };

    const elButton = !isPopupVisible && (
      <Button onClick={this.onClick} style={this.props.style}>
        {this.props.children}
      </Button>
    );

    return (
      <div {...css(styles.base, this.props.style)}>
        {elButton}
        {isPopupVisible && this.renderOptionsList()}
      </div>
    );
  }

  private renderOptionsList() {
    const styles = {
      base: css({ Absolute: [null, 0, -18, null] }),
      body: css({
        boxSizing: 'border-box',
        PaddingX: 5,
        PaddingY: 5,
        minWidth: 120,
        zIndex: 999,
      }),
      item: css({
        PaddingY: 8,
        PaddingX: 8,
        cursor: 'pointer',
        borderBottom: `solid 1px ${color.format(-0.1)}`,
        ':last-child': { borderBottom: 'none' },
      }),
    };

    const options = this.options;
    const elList = options.map((option, i) => {
      return (
        <div key={i} {...styles.item} onClick={option.onClick}>
          <Button>{option.label}</Button>
        </div>
      );
    });

    return (
      <Card style={styles.base}>
        <div {...styles.body} onMouseLeave={this.onPopupLeave}>
          {elList}
        </div>
      </Card>
    );
  }

  /**
   * [Handlers]
   */
  private onClick = () => {
    this.state$.next({ isPopupVisible: true });
  };

  private onPopupLeave = () => {
    this.state$.next({ isPopupVisible: false });
  };
}
