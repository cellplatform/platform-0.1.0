import './styles';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue, markdown, CSS } from '../../common';
import { Avatar, Text } from '../primitives';
import { Triangle } from './components/Triangle';
import { Editor } from '../Editor';
import * as buttons from '../buttons';

export type IThreadCommentProps = {
  avatarUrl?: string;
  bottomConnector?: number;
  header?: JSX.Element;
  body?: string;
  isEditing?: boolean;
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
    const { avatarUrl, isEditing } = this.props;
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

    const elBody = isEditing ? null : this.body ? this.renderBody() : this.renderEmpty();
    const elEditor = isEditing && this.renderEditor();

    return (
      <Text style={styles.base} className={CSS.CLASS.COMMENT}>
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
            {elBody}
            {elEditor}
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

  private renderEditor() {
    const styles = {
      base: css({}),
      editor: css({
        padding: 3,
      }),
      toolbar: css({
        borderTop: `solid 1px ${color.format(-0.1)}`,
        backgroundColor: color.format(-0.01),
        PaddingX: 15,
        PaddingY: 10,
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.editor}>
          <Editor value={this.body} />
        </div>
        {this.renderEditorToolbar()}
      </div>
    );
  }

  private renderEditorToolbar() {
    const styles = {
      base: css({
        borderTop: `solid 1px ${color.format(-0.1)}`,
        backgroundColor: color.format(-0.01),
        PaddingX: 15,
        PaddingY: 10,
        Flex: 'horiziontal-center-spaceBetween',
      }),
    };

    const MIN_WIDTH = 110;

    return (
      <div {...styles.base}>
        <div>
          <div />
        </div>
        <div>
          <buttons.HoverGrey label={'Cancel'} minWidth={MIN_WIDTH} margin={[null, 5, null, null]} />
          <buttons.Blue label={'Comment'} minWidth={MIN_WIDTH} />
        </div>
      </div>
    );
  }
}
