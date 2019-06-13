import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { t, css, color, GlamorValue, MONOSPACE } from '../common';
import { ObjectView } from './primitives';

export type IActionProps = {
  index: number;
  event: t.IStoreEvent;
  style?: GlamorValue;
};
export type IActionState = {
  isOpen?: boolean;
};

export class Action extends React.PureComponent<IActionProps, IActionState> {
  public state: IActionState = {};
  private unmounted$ = new Subject<{}>();
  private state$ = new Subject<Partial<IActionState>>();

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
   * [Render]
   */
  public render() {
    const { event } = this.props;
    const { isOpen } = this.state;
    const styles = {
      base: css({
        borderTop: `solid 1px ${color.format(0.1)}`,
        fontFamily: MONOSPACE.FAMILY,
        padding: 5,
        fontSize: 13,
        overflow: 'hidden',
      }),
      index: css({
        display: 'inline-block',
        opacity: 0.3,
        minWidth: 20,
        textAlign: 'right',
        marginRight: 6,
      }),
      object: css({
        marginTop: 5,
        paddingLeft: 10,
      }),
    };

    const elObject = isOpen && (
      <div {...styles.object}>
        <ObjectView name={'payload'} data={event.payload} theme={'DARK'} />
      </div>
    );

    return (
      <div {...css(styles.base, this.props.style)}>
        <div onClick={this.handleClick}>
          <span {...styles.index}>{this.props.index}</span>
          <span>{event.type}</span>
        </div>
        {elObject}
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private handleClick = () => {
    const isOpen = !this.state.isOpen;
    this.state$.next({ isOpen });
  };
}
