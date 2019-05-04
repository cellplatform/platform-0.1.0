import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  css,
  color,
  GlamorValue,
  t,
  ThreadComment,
  ThreadCommentHeader,
  constants,
  time,
  Hr,
  LOREM,
} from '../common';

const { URL } = constants;

const BODY = {
  MARKDOWN_1: `
🌼You dig?

  `,

  MARKDOWN_2: `
Hey **Bob**

${LOREM}

${LOREM}

🌼You dig?

  `,
};

export type ITestProps = {};

export class Test extends React.PureComponent<ITestProps, t.ITestState> {
  public state: t.ITestState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<t.ITestState>>();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
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
        flex: 1,
        Flex: 'start-center',
        padding: 50,
      }),
      outer: css({ width: 750 }),
      headerOuter: css({
        marginBottom: 50,
        marginLeft: 60,
      }),
    };

    const timestamp = time
      .day()
      .subtract(2, 'h')
      .toDate();

    const elHeader = <ThreadCommentHeader name={'mary@foo.com'} timestamp={timestamp} />;
    const body = BODY.MARKDOWN_1;

    return (
      <div {...styles.base}>
        <div {...styles.outer}>
          <div {...styles.headerOuter}>{elHeader}</div>
          <ThreadComment avatarUrl={URL.WOMAN_1} header={elHeader} body={body} />
        </div>
      </div>
    );
  }
}
