import './styles';

import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, CSS, css, GlamorValue, markdown, t, COLORS } from '../../common';
import { Avatar, Text } from '../primitives';
import { Editor } from './components/Editor';
import { Triangle } from './components/Triangle';

export type IThreadCommentProps = {
  avatarSrc?: string;
  bottomConnector?: number;
  header?: JSX.Element;
  body?: string;
  isEditing?: boolean;
  editor$?: Subject<t.TextEditorEvent>;
  style?: GlamorValue;
  onComment?: (e: {}) => void;
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
  private editor$ = this.props.editor$ || new Subject<t.TextEditorEvent>();

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
   * [Properties]
   */
  public get body() {
    return this.props.body || '';
  }

  /**
   * [Render]
   */
  public render() {
    const { avatarSrc, isEditing } = this.props;
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
      main: css({
        flex: 1,
        minHeight: SIZE.AVATAR,
        border: `solid 1px ${color.format(-0.15)}`,
        borderRadius: 3,
        backgroundColor: COLORS.WHITE,
      }),
    };

    const elBody = isEditing ? null : this.body ? this.renderBody() : this.renderEmpty();
    const elEditor = isEditing && (
      <Editor value={this.body} editor$={this.editor$} onComment={this.props.onComment} />
    );

    return (
      <Text style={styles.base} className={CSS.CLASS.COMMENT}>
        <div {...styles.inner}>
          <div {...styles.left}>
            <Avatar
              src={avatarSrc}
              size={SIZE.AVATAR}
              borderRadius={4}
              borderColor={-0.1}
              borderWidth={1}
              gravatarDefault={'404'}
            />
          </div>
          <div {...styles.main}>
            {this.renderHeader()}
            {elBody}
            {elEditor}
          </div>
        </div>
      </Text>
    );
  }

  private renderHeader() {
    const { isEditing } = this.props;
    const styles = {
      base: css({
        position: 'relative',
        minHeight: SIZE.AVATAR,
        backgroundColor: COLOR.HEADER.BG,
        borderBottom: `solid 1px ${color.format(isEditing ? -0.12 : -0.08)}`,
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
        userSelect: 'text',
      }),
    };
    const html = markdown.toHtmlSync(this.body);
    const className = `${CSS.CLASS.EDITOR_MARKDOWN} ${CSS.CLASS.MARKDOWN} `;

    return (
      <div {...styles.base} className={CSS.CLASS.COMMENT_BODY}>
        <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    );
  }

  private renderEmpty(props: { message?: string; style?: GlamorValue } = {}) {
    const { message = 'Nothing to display.' } = props;
    const styles = {
      base: css({
        pointerEvents: 'none',
        Flex: 'center-center',
        padding: 15,
        opacity: 0.3,
        fontStyle: 'italic',
        fontSize: 14,
      }),
    };
    return <div {...css(styles.base, props.style)}>{message}</div>;
  }
}
