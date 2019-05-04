import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  color,
  COLORS,
  constants,
  css,
  LOREM,
  t,
  ThreadComment,
  ThreadCommentHeader,
  time,
} from '../common';

const { URL } = constants;

export type ITestProps = {
  data: t.IObservableProps<t.IThreadCommentTestProps>;
};

export class Test extends React.PureComponent<ITestProps> {
  public state: t.ITestState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<t.ITestState>>();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    this.props.data.changed$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.forceUpdate());
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    const data = this.props.data;
    const styles = {
      base: css({
        flex: 1,
        Flex: 'start-center',
        padding: 15,
        paddingTop: 50,
      }),
      outer: css({ width: 750 }),
      headerOuter: css({
        paddingLeft: 60,
        paddingBottom: 30,
        marginBottom: 60,
        borderBottom: `dashed 1px ${color.alpha(COLORS.PINK, 0.3)}`,
      }),
    };

    const timestamp = time
      .day()
      .subtract(2, 'h')
      .toDate();

    const elHeader = <ThreadCommentHeader name={data.name} timestamp={timestamp} />;

    return (
      <div {...styles.base}>
        <div {...styles.outer}>
          <div {...styles.headerOuter}>{elHeader}</div>
          <ThreadComment
            avatarUrl={URL.WOMAN_1}
            header={elHeader}
            body={data.body}
            isEditing={data.isEditing}
          />
        </div>
      </div>
    );
  }
}
