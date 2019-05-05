import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, GlamorValue } from '../../common';
import { ThreadComment } from '../ThreadComment';
import { Divider } from '../Divider';

export type IConversationProps = { style?: GlamorValue };
export type IConversationState = {};

const TEMP = {
  WOMAN_1: require('../../../static/images/woman-1.jpg'),
  WOMAN_2: require('../../../static/images/woman-2.jpg'),
};

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
        paddingTop: 20,
        flex: 1,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.body}>
          <ThreadComment avatarUrl={TEMP.WOMAN_1} />
          <Divider height={25} left={78} />
          <ThreadComment avatarUrl={TEMP.WOMAN_2} />
          <Divider height={25} left={78} />
          <ThreadComment avatarUrl={TEMP.WOMAN_1} isEditing={true} />
        </div>
      </div>
    );
  }
}
