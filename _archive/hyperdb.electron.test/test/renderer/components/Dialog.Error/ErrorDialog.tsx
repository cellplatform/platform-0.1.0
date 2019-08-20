import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { COLORS, color, css, GlamorValue, t } from '../../common';
import { Dialog } from '../Dialog';

export type IErrorDialogProps = {
  error: string;
  command?: t.ICommand;
  style?: GlamorValue;
  onClose?: (e: {}) => void;
};
export type IErrorDialogState = {};

export class ErrorDialog extends React.PureComponent<IErrorDialogProps, IErrorDialogState> {
  public state: IErrorDialogState = {};
  private unmounted$ = new Subject<{}>();
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
      footer: css({
        borderTop: `solid 1px ${color.format(-0.2)}`,
        marginTop: 10,
        paddingTop: 10,
        fontSize: 12,
        color: color.format(-0.3),
      }),
      error: css({}),
    };

    const footer = command ? `command: ${command.name}` : undefined;
    const elFooter = footer && <div {...styles.footer}>{footer}</div>;

    return (
      <div {...styles.base}>
        <div {...styles.body}>
          <div {...styles.error}>{error}</div>
          {elFooter}
        </div>
      </div>
    );
  };
}
