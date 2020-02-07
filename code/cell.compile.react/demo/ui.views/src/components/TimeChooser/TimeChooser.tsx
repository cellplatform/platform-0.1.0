import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { COLORS, css, color, CssValue, t, time } from '../../common';

import { Button } from '@platform/ui.button';
import { Spinner } from '@platform/ui.spinner';

export type ITimeChooserProps = {
  current?: number;
  isSpinning?: boolean;
  style?: CssValue;
  onChanged?: (e: { from: number; to: number }) => void;
};
export type ITimeChooserState = {};

export class TimeChooser extends React.PureComponent<ITimeChooserProps, ITimeChooserState> {
  public state: ITimeChooserState = {};
  private state$ = new Subject<Partial<ITimeChooserState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: ITimeChooserProps) {
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
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        color: COLORS.DARK,
        backgroundColor: color.format(0.9),
        border: `solid 1px ${color.format(-0.5)}`,
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: `0 2px 20px 0 ${color.format(-0.8)}`,
        padding: 40,
        Flex: 'center-center',
      }),
      body: css({
        Flex: 'horizontal-stretch-stretch',
      }),
      divider: css({
        MarginX: 50,
        borderLeft: `solid 5px ${color.format(-0.1)}`,
      }),
      spinner: css({
        Absolute: 0,
        Flex: 'center-center',
        backgroundColor: color.format(0.8),
      }),
    };

    // HACK: hard coded days.
    const today = time
      .day('Feb 08 2020 GMT+1300')
      .toDate()
      .getTime();
    const tomorrow = time
      .day('Feb 09 2020 GMT+1300')
      .toDate()
      .getTime();

    const elSpinner = this.props.isSpinning && (
      <div {...styles.spinner}>
        <Spinner size={32} />
      </div>
    );

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.body}>
          {this.renderDay({ day: today })}
          <div {...styles.divider} />
          {this.renderDay({ day: tomorrow })}
        </div>
        {elSpinner}
      </div>
    );
  }

  private renderDay(props: { day: number }) {
    const day = time.day(props.day).startOf('day');

    const styles = {
      base: css({}),
      title: css({
        fontSize: 36,
        fontWeight: 'bold',
        borderBottom: `solid 3px ${color.format(-0.2)}`,
        PaddingX: 20,
        paddingBottom: 5,
        marginBottom: 10,
      }),
      days: css({
        // PaddingX: 20,
        textAlign: 'center',
        lineHeight: '2em',
      }),
    };

    const hours = Array.from({ length: 10 }).map((v, i) => i + 8);

    const elDays = hours.map((hour, i) => {
      const time = day
        .add(hour, 'h')
        .toDate()
        .getTime();
      return this.renderTime({ key: i.toString(), time });
    });

    return (
      <div {...styles.base}>
        <div {...styles.title}>{day.format('ddd D MMM')}</div>
        <div {...styles.days}>{elDays}</div>
      </div>
    );
  }

  private renderTime(props: { time: number; key: string }) {
    const day = time.day(props.time);
    const styles = {
      base: css({
        fontSize: 26,
      }),
    };

    const label = day.format('hh:mm a');
    const date = day.toDate().getTime();

    return (
      <div key={props.key} {...styles.base}>
        <Button label={label} onClick={this.changeClickHandler(date)} />
      </div>
    );
  }

  /**
   * [Handlers]
   */

  private changeClickHandler = (date: number) => {
    return async () => {
      const { onChanged } = this.props;
      if (onChanged) {
        const { current } = this.props;
        const from = time.day(current);
        const to = time.day(date);
        onChanged({ from: from.toDate().getTime(), to: to.toDate().getTime() });
      }
    };
  };
}
