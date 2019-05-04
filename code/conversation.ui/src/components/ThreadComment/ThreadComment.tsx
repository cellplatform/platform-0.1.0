import './styles';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue, markdown, CSS } from '../../common';
import { Avatar, Text } from '../primitives';
import { Triangle } from './components/Triangle';

export type IThreadCommentProps = {
  avatarUrl?: string;
  bottomConnector?: number;
  header?: JSX.Element;
  body?: string;
  style?: GlamorValue;
};
export type IThreadCommentState = {};

const SIZE = {
  AVATAR: 44,
  LEFT_MARGIN: 60,
};

const COLOR = {
  HEADER: {
    BG: color
      .create('#fff')
      .darken(2.5)
      .toHexString(),
  },
};

export class ThreadComment extends React.PureComponent<IThreadCommentProps, IThreadCommentState> {
  public state: IThreadCommentState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<IThreadCommentState>>();

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
   * [Properties]
   */
  public get body() {
    return this.props.body || '';
  }

  /**
   * [Render]
   */
  public render() {
    const { avatarUrl } = this.props;
    const styles = {
      base: css({
        display: 'block',
        boxSizing: 'border-box',
        userSelect: 'none',
      }),
      inner: css({
        Flex: 'horizontal',
      }),
      left: css({
        width: SIZE.LEFT_MARGIN,
      }),
      right: css({
        flex: 1,
        minHeight: SIZE.AVATAR,
        border: `solid 1px ${color.format(-0.1)}`,
        borderRadius: 3,
      }),
    };
    return (
      <Text style={styles.base}>
        <div {...styles.inner}>
          <div {...styles.left}>
            <Avatar
              src={avatarUrl}
              size={SIZE.AVATAR}
              borderRadius={4}
              borderColor={-0.1}
              borderWidth={1}
            />
          </div>
          <div {...styles.right}>
            {this.renderHeader()}
            {this.body ? this.renderBody() : this.renderEmpty()}
          </div>
        </div>
      </Text>
    );
  }

  private renderHeader() {
    const styles = {
      base: css({
        position: 'relative',
        minHeight: SIZE.AVATAR,
        backgroundColor: COLOR.HEADER.BG,
        borderBottom: `solid 1px ${color.format(-0.08)}`,
        Flex: 'center-start',
      }),
      triangle: css({
        Absolute: [14, null, null, -8],
      }),
    };
    return (
      <div {...styles.base}>
        <Triangle style={styles.triangle} backgroundColor={COLOR.HEADER.BG} borderColor={-0.1} />
        {this.props.header}
      </div>
    );
  }

  private renderBody() {
    const styles = {
      base: css({
        padding: 15,
        // PaddingX: 15,
        userSelect: 'text',
      }),
    };
    const html = markdown.toHtmlSync(this.body);
    const className = `${CSS.CLASS.MARKDOWN} ${CSS.CLASS.COMMENT} `;

    return (
      <div {...styles.base}>
        <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    );
  }

  private renderEmpty() {
    const styles = {
      base: css({
        Flex: 'center-center',
        padding: 15,
        opacity: 0.3,
        fontStyle: 'italic',
        fontSize: 14,
      }),
    };
    return <div {...styles.base}>Nothing to display.</div>;
  }
}
