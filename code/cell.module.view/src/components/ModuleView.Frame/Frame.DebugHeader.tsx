import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { COLORS, css, CssValue, t } from '../../common';

export type IDebugHeaderProps = {
  rendered: t.IModuleRendered<any>;
  style?: CssValue;
};
export type IDebugHeaderState = { isOver?: boolean };

export class DebugHeader extends React.PureComponent<IDebugHeaderProps, IDebugHeaderState> {
  public state: IDebugHeaderState = {};
  private state$ = new Subject<Partial<IDebugHeaderState>>();
  private unmounted$ = new Subject();

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
  public get isOver() {
    return this.state.isOver || false;
  }

  private get text() {
    const { el, view, target } = this.props.rendered;
    const parts: string[] = [];
    const typename = el?.type?.name;

    if (typename) {
      parts.push(`<${typename}>`);
    }
    if (!typename && view) {
      parts.push(`view: "${view}"`);
    }
    if (target) {
      parts.push(`target: "${target}"`);
    }

    return parts.length === 0 ? '' : parts.join(' ');
  }

  /**
   * [Render]
   */
  public render() {
    const isOver = this.isOver;

    const styles = {
      base: css({
        Absolute: [isOver ? -18 : -14, isOver ? -100 : 0, null, isOver ? -100 : 0],
        fontSize: isOver ? 12 : 7,
        opacity: isOver ? 1 : 0.7,
        textAlign: 'center',
        Flex: 'horizontal-end-spaceBetween',
        fontFamily: 'Menlo, monospace',
        color: COLORS.DARK,
        userSelect: 'none',
        PaddingX: 8,
      }),
      ellipsis: css({
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }),
    };
    return (
      <div
        {...css(styles.base, this.props.style)}
        onMouseEnter={this.overHandler(true)}
        onMouseLeave={this.overHandler(false)}
      >
        <div />
        <div {...styles.ellipsis}>{this.text}</div>
        <div />
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private overHandler = (isOver: boolean) => {
    return () => {
      this.state$.next({ isOver });
    };
  };
}
