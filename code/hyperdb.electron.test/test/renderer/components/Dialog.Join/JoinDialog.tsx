import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { css, color, GlamorValue, IMAGES, events } from '../../common';
import { Dialog } from '../Dialog';
import { TextInput, TextInputChangeEvent, Button } from '../primitives';
import { JoinWithKeyEventHandler } from './types';

export type IJoinDialogProps = {
  style?: GlamorValue;
  onJoin?: JoinWithKeyEventHandler;
  onClose?: (e: {}) => void;
};
export type IJoinDialogState = {
  dbKey?: string;
};

export class JoinDialog extends React.PureComponent<IJoinDialogProps, IJoinDialogState> {
  public state: IJoinDialogState = {};
  private unmounted$ = new Subject<{}>();
  private state$ = new Subject<IJoinDialogState>();

  private elKeyTextbox: TextInput | undefined;
  private elKeyTextboxRef = (ref: TextInput) => (this.elKeyTextbox = ref);

  /**
   * [Lifecycle]
   */

  constructor(props: IJoinDialogProps) {
    super(props);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    events.keyPress$
      .pipe(
        takeUntil(this.unmounted$),
        filter(e => e.isPressed),
        filter(e => e.key === 'Enter'),
        filter(e => this.canJoin),
      )
      .subscribe(e => this.handleJoinClick());
  }

  public componentDidMount() {
    this.focus();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */
  public get dbKey() {
    return this.state.dbKey || '';
  }

  public get canJoin() {
    const dbKey = this.dbKey;
    return dbKey.length >= 64;
  }

  /**
   * [Methods]
   */
  public focus() {
    if (this.elKeyTextbox) {
      this.elKeyTextbox.focus();
    }
  }

  /**
   * [Render]
   */

  public render() {
    return (
      <Dialog style={this.props.style} onClose={this.props.onClose}>
        {this.renderBody()}
      </Dialog>
    );
  }

  private renderBody = () => {
    const fontSize = 18;
    const styles = {
      base: css({
        flex: 1,
        Flex: 'center-center',
      }),
      body: css({
        flex: 1,
        maxWidth: 800,
        MarginX: 80,
        Flex: 'horizontal-center-center',
      }),
      icon: css({
        Image: [IMAGES.KEYS, IMAGES.KEYS2x, 81, 104],
      }),
      inputBody: css({
        flex: 1,
        marginLeft: 10,
        borderBottom: `solid 2px ${color.format(-0.1)}`,
        Flex: 'horizontal',
      }),
      textbox: css({
        flex: 1,
      }),
      joinButton: css({
        fontSize,
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.body}>
          <div {...styles.icon} />
          <div {...styles.inputBody}>
            <TextInput
              ref={this.elKeyTextboxRef}
              style={styles.textbox}
              onChange={this.handleKeyInput}
              value={this.state.dbKey}
              valueStyle={{ fontSize, color: color.format(-0.7) }}
              placeholder={'Database Public Key'}
              placeholderStyle={{ color: color.format(-0.2) }}
              maxLength={75}
            />
            <Button
              label={'join'}
              style={styles.joinButton}
              onClick={this.handleJoinClick}
              isEnabled={this.canJoin}
            />
          </div>
        </div>
      </div>
    );
  };

  /**
   * [Handlers]
   */

  private handleKeyInput = async (e: TextInputChangeEvent) => {
    this.setState({ dbKey: e.to });
  };

  private handleJoinClick = () => {
    const { onJoin: onJoinClick } = this.props;
    const dbKey = this.dbKey;
    if (onJoinClick && dbKey && this.canJoin) {
      onJoinClick({ dbKey });
    }
  };
}
