import * as React from 'react';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  constants,
  css,
  color,
  CssValue,
  COLORS,
  parseClient,
  t,
  time,
  log,
  defaultValue,
  coord,
} from '../../common';

import { Spinner } from '@platform/ui.spinner';
import { Button } from '@platform/ui.button';
import { Avatar } from '@platform/ui.image';
import { Log } from '../Log';
import { TimeChooser } from '../TimeChooser';
import { Agenda } from './Agenda';

const { URLS } = constants;

type Invitee = {
  row: number;
  email: string;
  avatar: string;
  accepted?: boolean;
};

export type IInviteProps = { style?: CssValue };
export type IInviteState = {
  title?: string;
  date?: string;
  invitees?: Invitee[];
  logRef?: string;
  log?: t.ILogItem[];
  spinning?: number[];
  isTimeChooserShowing?: boolean;
  isTimeChooserSpinning?: boolean;
  isAgendaExpanded?: boolean;
};

export class Invite extends React.PureComponent<IInviteProps, IInviteState> {
  public state: IInviteState = {};
  private state$ = new Subject<Partial<IInviteState>>();
  private unmounted$ = new Subject<{}>();

  private client: t.IClient;
  private ns: string;

  /**
   * [Lifecycle]
   */
  constructor(props: IInviteProps) {
    super(props);
  }

  public componentDidMount() {
    const res = parseClient(location.href);
    this.client = res.client;
    this.ns = res.def;
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    this.load();

    // Redraw interval.
    // Ensure "date countdown" is refreshed
    interval(1000 * 1).subscribe(() => this.forceUpdate());
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * Properties
   */
  private get date() {
    const date = this.state.date;
    return date ? time.day(date) : undefined;
  }

  /**
   * [Methods]
   */

  private load = async () => {
    const client = this.client.ns(this.ns);
    const def = await client.read({ cells: true });
    const cells = def.body.data.cells || {};

    const toString = (input?: any) => (input || '').toString();

    const getInvittee = (row: number) => {
      const email = toString(cells[`B${row + 1}`]?.value);
      const avatar = toString(cells[`C${row + 1}`]?.value);
      const accepted = cells[`D${row + 1}`]?.value as boolean | undefined;
      const res: Invitee = { row, accepted, email, avatar };
      return res;
    };

    const title = toString(cells.B1?.value);
    const date = toString(cells.C6?.value);
    const invitees = [getInvittee(1), getInvittee(2)];
    const logNs = toString(cells.B5?.value);

    this.state$.next({
      title,
      date,
      invitees,
      logRef: logNs,
    });

    const logItems = await this.readLog({ range: true });
    this.state$.next({ log: logItems });

    log.group('data');
    log.info('host:', this.client.origin);
    log.info('def:', this.ns);
    log.info('log:', logNs);
    log.info('def.cells:', cells);
    log.info('state:', this.state);
    log.groupEnd();
  };

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'horizontal-stretch-stretch',
        backgroundColor: COLORS.DARK,
        color: COLORS.WHITE,
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        {this.renderLeft()}
        {this.renderRight()}
      </div>
    );
  }

  private renderLeft() {
    const styles = {
      base: css({
        position: 'relative',
        Flex: 'vertical-stretch-stretch',
        flex: 0.5,
        minWidth: 400,
        maxWidth: 500,
        overflow: 'hidden',
      }),
      top: css({
        flex: 1,
        Flex: 'center-center',
      }),
      bottom: css({
        borderTop: `dashed 1px ${color.format(0.8)}`,
        display: 'flex',
        height: 200,
      }),
      agenda: css({
        position: 'relative',
        Absolute: [0, 0, 200, 0],
      }),
      title: css({
        fontSize: 45,
        fontWeight: 'bold',
        lineHeight: '1em',
        userSelect: 'none',
        filter: `blur(${this.state.isAgendaExpanded ? 4 : 0}px)`,
        transition: `filter 1.3s`,
      }),
      refresh: css({
        Absolute: [10, null, null, 10],
        fontSize: 12,
      }),
    };

    const title = this.state.title || 'Loading...';
    const elTitle = title.split(' ').map((value, i) => <div key={i}>{value}</div>);

    return (
      <div {...styles.base}>
        <div {...styles.top}>
          <div {...styles.title}>{elTitle}</div>
        </div>
        <div {...styles.agenda} onClick={this.toggleAgendaExpanded}>
          <Agenda isExpanded={this.state.isAgendaExpanded} />
        </div>
        <Button onClick={this.load} style={styles.refresh} label={'Refresh'} />
        <div {...styles.bottom}>{this.renderBottomLeft()}</div>
      </div>
    );
  }

  private renderRight() {
    const { isTimeChooserShowing = false } = this.state;
    const styles = {
      base: css({
        flex: 1,
        position: 'relative',
        backgroundImage: `url(${URLS.NZ})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
      }),
      bevel: css({
        Absolute: [0, null, 0, 0],
        width: 10,
        backgroundColor: color.format(0.15),
      }),
      timeChooser: css({
        Absolute: [50, 50, 70, 50],
      }),
    };

    const elTimeEditor = isTimeChooserShowing && (
      <TimeChooser
        current={this.date?.toDate().getTime()}
        isSpinning={this.state.isTimeChooserSpinning}
        style={styles.timeChooser}
        onChanged={this.onTimeChanged}
      />
    );

    return (
      <div {...styles.base}>
        <div {...styles.bevel} />
        {this.renderLog()}
        {this.renderCountdown()}
        {this.renderDate()}
        {elTimeEditor}
      </div>
    );
  }

  private renderBottomLeft() {
    const styles = {
      base: css({
        position: 'relative',
        flex: 1,
      }),
      bgMask: css({
        Absolute: 0,
        backgroundColor: COLORS.DARK,
      }),
      body: css({
        Absolute: 0,
        Flex: 'center-center',
      }),
      topShadow: css({
        Absolute: [-6, 0, null, 0],
        height: 10,
        backgroundColor: color.format(-1),
        filter: `blur(5px)`,
        opacity: 0.4,
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.topShadow} />
        <div {...styles.bgMask} />
        <div {...styles.body}>{this.renderAvatars()}</div>
      </div>
    );
  }

  private renderAvatars() {
    const { invitees = [] } = this.state;
    if (invitees.length === 0) {
      return null;
    }

    const styles = {
      base: css({
        Flex: 'horizontal-center-center',
      }),
    };

    const { spinning = [] } = this.state;
    const elList = invitees.map((person, i) => {
      const isLast = i === invitees.length - 1;
      const isSpinning = spinning.includes(person.row);
      const elAvatar = this.renderAvatar({ index: i, person, isSpinning });
      const elDivider = isLast ? undefined : this.renderAvatarDivider({ key: `div-${i}` });
      return [elAvatar, elDivider];
    });

    return <div {...styles.base}>{elList}</div>;
  }

  private renderAvatarDivider(props: { key?: string | number } = {}) {
    const styles = {
      base: css({
        position: 'relative',
        Flex: 'horizontal-center-center',
      }),
      divider: css({
        width: 75,
        border: `solid 2px ${color.format(1)}`,
      }),
      dividerEdge: css({
        width: 6,
        marginRight: 4,
      }),
      dividerMain: css({}),
    };
    return (
      <div {...styles.base} key={props.key}>
        <div {...css(styles.divider, styles.dividerMain)} />
      </div>
    );
  }

  private renderAvatar(props: {
    index: number;
    person: Invitee;
    size?: number;
    isSpinning?: boolean;
  }) {
    const { index, person, size = 55, isSpinning } = props;

    const styles = {
      base: css({
        position: 'relative',
        MarginX: 8,
      }),
      accept: css({
        Absolute: [-26, -35, null, -35],
        fontSize: 14,
        textAlign: 'center',
      }),
      name: css({
        Absolute: [null, -35, -16, -35],
        fontSize: 11,
        textAlign: 'center',
      }),
      emoji: css({
        Absolute: [null, -8, 5, null],
        fontSize: 20,
      }),
      spinner: css({
        Absolute: [-28, null, null, 16],
      }),
    };

    const label = person.accepted ? 'Accepted' : 'Accept';
    const emoji = person.accepted && <div {...styles.emoji}>🎉</div>;

    const elButton = !isSpinning && <Button label={label} onClick={this.acceptHandler(index)} />;
    const elSpinner = isSpinning && <Spinner color={1} style={styles.spinner} />;

    return (
      <div {...styles.base} key={`avatar-${index}`}>
        <div {...styles.accept}>{elButton}</div>
        <Avatar
          src={person.avatar}
          size={size}
          borderRadius={size / 2}
          borderColor={0.1}
          borderWidth={6}
        />
        {elSpinner}
        {emoji}
        <div {...styles.name}>{person.email}</div>
      </div>
    );
  }

  private renderLog() {
    const { log: items = [] } = this.state;
    if (items.length === 0) {
      return null;
    }

    const styles = {
      base: css({
        Absolute: [0, 0, 0, null],
        width: 300,
        backgroundColor: color.format(0.6),
      }),
      log: css({ Absolute: 0 }),
      bevel: css({
        Absolute: [0, null, 0, -10],
        width: 10,
        backgroundColor: color.format(0.15),
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.bevel} />
        <Log style={styles.log} items={items} />
      </div>
    );
  }

  private renderCountdown() {
    const date = this.state.date;
    if (!date) {
      return null;
    }

    const now = time.now.timestamp;
    const meetingAt = new Date(date).getTime();

    const diff = Math.max(0, meetingAt - now);
    const duration = time.duration(diff);

    if (diff <= 0) {
      return null;
    }

    const styles = {
      base: css({
        Absolute: [-10, null, null, 30],
      }),
      text: css({
        fontSize: 200,
        fontWeight: 'bold',
        letterSpacing: '-0.03em',
        opacity: 0.5,
        userSelect: 'none',
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.text}>{duration.toString()}</div>
      </div>
    );
  }

  private renderDate() {
    const date = this.date;
    if (!date) {
      return null;
    }
    const styles = {
      base: css({
        Absolute: [null, null, 10, 28],
        fontWeight: 'bold',
        fontSize: 32,
      }),
    };
    return (
      <div {...styles.base}>
        {date.format('ddd D MMM, h:mma')}{' '}
        <Button label={'change'} onClick={this.onChangeTimeClick} />
      </div>
    );
  }

  /**
   * [Handlers]
   */

  private acceptHandler = (index: number) => {
    return async () => {
      const person = (this.state.invitees || [])[index];
      if (person) {
        const accepted = !person.accepted;
        this.state$.next({ spinning: [person.row] }); // Start spinner.

        // Write the updated status for the person.
        const key = `D${person.row + 1}`;
        const cells: t.ICellMap = {
          [key]: { value: accepted },
        };
        const client = this.client.ns(this.ns);
        await client.write({ cells });

        // Write log.
        const title = `Invite ${accepted ? 'Accepted' : 'Declined'}`;
        const message = `${person.email} ${accepted ? 'is going' : 'is not going'} to the meeting.`;
        await this.writeLog({ title, message });

        // Redraw the screen.
        await this.load();
        this.state$.next({ spinning: undefined }); // Stop spinner.
      }
    };
  };

  private readLog = async (args: { range?: string | boolean } = {}): Promise<t.ILogItem[]> => {
    const ns = this.state.logRef;
    if (!ns) {
      return [];
    }
    const client = this.client.ns(ns);
    const range = defaultValue(args.range, true);
    const cells = (await client.read({ cells: range })).body.data.cells || {};

    return Object.keys(cells)
      .filter(key => key.startsWith('A'))
      .reduce((acc, next) => {
        const { row } = coord.cell.fromKey(next);
        const id = next;
        const date = (cells[next]?.value || -1) as number;
        const title = cells[`B${row + 1}`]?.value as string;
        const detail = cells[`C${row + 1}`]?.value as string;
        acc.push({ id, date, title, detail });
        return acc;
      }, [] as t.ILogItem[]);
  };

  private writeLog = async (args: { title: string; message: string }) => {
    if (!this.state.logRef) {
      return;
    }
    const client = this.client.ns(this.state.logRef);
    const current = await this.readLog({ range: 'A' });

    const row = current.length;
    const now = time.now.timestamp;
    const { title, message } = args;

    const cells: t.ICellMap = {
      [`A${row + 1}`]: { value: now },
      [`B${row + 1}`]: { value: title },
      [`C${row + 1}`]: { value: message },
    };
    await client.write({ cells }, { cells: true });
  };

  private onChangeTimeClick = () => {
    const isTimeChooserShowing = !Boolean(this.state.isTimeChooserShowing);
    this.state$.next({ isTimeChooserShowing });
  };

  private onTimeChanged = async (e: { from: number; to: number }) => {
    this.state$.next({ isTimeChooserSpinning: true });
    const client = this.client.ns(this.ns);

    const from = time.day(e.from);
    const to = time.day(e.to);

    const cells: t.ICellMap = {
      C6: { value: to.toString() },
    };
    await client.write({ cells });

    const format = 'ddd h:mma';
    const title = 'Meeting Time Changed';
    const message = `From ${from.format(format)} to ${to.format(format)}`;
    await this.writeLog({ title, message });

    // Redraw.
    await this.load();
    this.state$.next({ isTimeChooserShowing: false, isTimeChooserSpinning: false });
  };

  private toggleAgendaExpanded = () => {
    const isAgendaExpanded = !Boolean(this.state.isAgendaExpanded);
    this.state$.next({ isAgendaExpanded });
  };
}
