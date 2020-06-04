import * as React from 'react';

import { color, css, CssValue, t, ui } from '../../common';
import { ErrorBoundary, ErrorView } from '../Error';
import { ShellTree } from './Shell.Tree';
import { ShellView } from './Shell.View';

export type IShellProps = {
  style?: CssValue;
};

export class Shell extends React.Component<IShellProps> {
  public static contextType = ui.Context;
  public context!: t.IFinderContext;

  /**
   * [Properties]
   */
  public get error() {
    const state = this.context?.getState();
    return state?.error || {};
  }

  /**
   * [Render]
   */
  public render() {
    const error = this.error;
    const styles = {
      base: css({
        position: 'relative',
        Flex: 'horizontal-stretch-stretch',
        boxSizing: 'border-box',
      }),
      left: css({
        position: 'relative',
        display: 'flex',
        width: 240,
      }),
      leftBorder: css({
        Absolute: [0, null, 0, 0],
        backgroundColor: color.format(-0.15),
        width: 1,
      }),
      right: css({
        position: 'relative',
        display: 'flex',
        flex: 1,
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.left}>
          <ErrorBoundary name={'tree'}>
            <ShellTree />
          </ErrorBoundary>
          {this.renderError(error.tree)}
        </div>
        <div {...styles.right}>
          <ErrorBoundary name={'view'}>
            <ShellView />
          </ErrorBoundary>
          {this.renderError(error.view)}
          <div {...styles.leftBorder}></div>
        </div>
      </div>
    );
  }

  private renderError(err?: t.IFinderError) {
    return err ? <ErrorView error={err.error} component={err.component} /> : null;
  }
}
