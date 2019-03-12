import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { COLORS, color, css, GlamorValue, t } from '../../common';
import { Dialog } from '../Dialog';

export type IErrorDialogProps = {
  command: t.ICommand;
  error: string;
  style?: GlamorValue;
  onClose?: (e: {}) => void;
};
export type IErrorDialogState = {};

export class ErrorDialog extends React.PureComponent<IErrorDialogProps, IErrorDialogState> {
  public state: IErrorDialogState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<IErrorDialogState>();

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
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
    const { error, command } = this.props;
    const styles = {
      base: css({
        flex: 1,
        Flex: 'center-center',
      }),
      body: css({
        flex: 1,
        maxWidth: 600,
        MarginX: 80,
        color: COLORS.CLI.MAGENTA,
      }),
      title: css({
        borderBottom: `solid 1px ${color.format(-0.2)}`,
        paddingBottom: 10,
        marginBottom: 10,
      }),
      error: css({}),
    };

    const title = command ? `Error within command '${command.name}'` : 'Error';

    return (
      <div {...styles.base}>
        <div {...styles.body}>
          <div {...styles.title}>{title}</div>
          <div {...styles.error}>{error}</div>
        </div>
      </div>
    );
  };
}
