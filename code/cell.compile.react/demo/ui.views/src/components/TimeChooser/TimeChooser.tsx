import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { COLORS, css, color, CssValue, t, time } from '../../common';

import { Button, Spinner, Icons } from '../primitives';

export type ITimeChooserProps = {
  meetingTime?: number;
  isSpinning?: boolean;
  style?: CssValue;
  onChanged?: (e: { from: number; to: number }) => void;
  onCloseClick?: (e: {}) => void;
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
    const { meetingTime = -1 } = this.props;

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
        // borderLeft: `solid 5px ${color.format(-0.1)}`,
      }),
      spinner: css({
        Absolute: 0,
        Flex: 'center-center',
        backgroundColor: color.format(0.8),
      }),
      closeButton: css({
        Absolute: [10, 10, null, null],
      }),
    };

    const dayOf = time.day(this.props.meetingTime);
    const dayBefore = dayOf
      .subtract(1, 'day')
      .toDate()
      .getTime();
    const dayAfter = dayOf
      .add(1, 'day')
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
          {this.renderDay({ day: dayBefore, meetingTime })}
          <div {...styles.divider} />
          {this.renderDay({ day: dayOf.toDate().getTime(), meetingTime })}
          <div {...styles.divider} />
          {this.renderDay({ day: dayAfter, meetingTime })}
        </div>
        {elSpinner}
        <Button {...styles.closeButton} onClick={this.onCloseClick} style={styles.closeButton}>
          <Icons.Close />
        </Button>
      </div>
    );
  }

  private renderDay(props: { day: number; meetingTime: number }) {
    const { meetingTime } = props;
    const day = time.day(props.day).startOf('day');

    const styles = {
      base: css({}),
      title: css({
        fontSize: 26,
        fontWeight: 'bold',
        borderBottom: `solid 8px ${color.format(-0.1)}`,
        PaddingX: 20,
        paddingBottom: 5,
        marginBottom: 10,
      }),
      days: css({
        textAlign: 'center',
        lineHeight: '1.8em',
      }),
      day: css({
        Flex: 'horizontal-stetch-stretch',
        // backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
        marginBottom: 10,
      }),
      divider: css({
        borderLeft: `solid 1px ${color.format(-0.2)}`,
        MarginX: 20,
      }),
    };

    const hours = Array.from({ length: 10 }).map((v, i) => i + 8);
    // const elDays: any[] = [];
    const elDays = hours.map((hour, i) => {
      const left = this.renderTime({
        key: `hour-${i}`,
        meetingTime,
        time: day
          .add(hour, 'h')
          .toDate()
          .getTime(),
      });

      const right = this.renderTime({
        key: `half-hour-${i}`,
        meetingTime,
        time: day
          .add(hour, 'h')
          .add(30, 'm')
          .toDate()
          .getTime(),
      });

      return (
        <div key={i} {...styles.day}>
          {left}
          <div {...styles.divider} />
          {right}
        </div>
      );
    });

    return (
      <div {...styles.base}>
        <div {...styles.title}>{day.format('ddd D MMM')}</div>
        <div {...styles.days}>{elDays}</div>
      </div>
    );
  }

  private renderTime(props: { time: number; meetingTime: number; key: string }) {
    const hour = time.day(props.time);
    const meetingTime = time.day(props.meetingTime);
    const styles = {
      base: css({
        fontSize: 16,
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
    const isSameDay = hour.format(dayFormat) === meetingTime.format(dayFormat);
    const isSameHour = hour.hour() === meetingTime.hour();
    const isCurrent = isSameDay && isSameHour;

    return (
      <div key={props.key} {...css(styles.base, isCurrent && styles.current)}>
        <Button
          isEnabled={!isCurrent}
          label={label}
          onClick={this.changeClickHandler(date)}
          theme={{ disabledOpacity: 1 }}
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
        const { meetingTime: current } = this.props;
        const from = time.day(current);
        const to = time.day(date);
        onChanged({ from: from.toDate().getTime(), to: to.toDate().getTime() });
      }
    };
  };

  private onCloseClick = () => {
    const { onCloseClick } = this.props;
    if (onCloseClick) {
      onCloseClick({});
    }
  };
}
