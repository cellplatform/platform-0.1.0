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
    const { current = -1 } = this.props;

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

    // 🐷HACK: hard coded days.
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
          {this.renderDay({ day: today, current })}
          <div {...styles.divider} />
          {this.renderDay({ day: tomorrow, current })}
        </div>
        {elSpinner}
      </div>
    );
  }

  private renderDay(props: { day: number; current: number }) {
    const { current } = props;
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
      return this.renderTime({ key: i.toString(), time, current });
    });

    return (
      <div {...styles.base}>
        <div {...styles.title}>{day.format('ddd D MMM')}</div>
        <div {...styles.days}>{elDays}</div>
      </div>
    );
  }

  private renderTime(props: { time: number; current: number; key: string }) {
    const hour = time.day(props.time);
    const current = time.day(props.current);
    const styles = {
      base: css({
        fontSize: 26,
      }),
      current: css({
        color: 'red',
        backgroundColor: color.format(-0.03),
        border: `solid 1px ${color.format(-0.1)}`,
        borderRadius: 5,
      }),
    };

    const label = hour.format('hh:mm a');
    const date = hour.toDate().getTime();

    const dayFormat = 'D/MM/YYYY';
    const isSameDay = hour.format(dayFormat) === current.format(dayFormat);
    const isSameHour = hour.hour() === current.hour();
    const isCurrent = isSameDay && isSameHour;

    return (
      <div key={props.key} {...css(styles.base, isCurrent && styles.current)}>
        <Button
          isEnabled={!isCurrent}
          label={label}
          onClick={this.changeClickHandler(date)}
          theme={{
            disabledOpacity: 1,
          }}
        />
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
