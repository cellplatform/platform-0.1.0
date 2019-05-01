import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue } from '../../common';
import { Editor } from '../Editor';

export type IConversationProps = { style?: GlamorValue };
export type IConversationState = {};

export class Conversation extends React.PureComponent<IConversationProps, IConversationState> {
  public state: IConversationState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<IConversationState>>();

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
        Flex: 'vertical-stretch-stretch',
      }),
      body: css({
        flex: 1,
      }),
      editor: css({
        borderTop: `solid 6px ${color.format(-0.1)}`,
        height: 220,
        display: 'flex',
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.body}>
          <div>body.</div>
        </div>
        <div {...styles.editor}>
          <Editor />
        </div>
      </div>
    );
  }
}
