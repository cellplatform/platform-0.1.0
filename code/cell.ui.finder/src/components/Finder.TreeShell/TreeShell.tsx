import * as React from 'react';
import { Subject } from 'rxjs';

import { color, css, CssValue, t, ui } from '../../common';
import { TreeShellTree } from './TreeShell.Tree';
import { TreeShellView } from './TreeShell.View';
import { ErrorView, ErrorBoundary } from '../Error';

export type ITreeShellProps = {
  style?: CssValue;
};

export class TreeShell extends React.Component<ITreeShellProps> {
  private unmounted$ = new Subject<{}>();

  public static contextType = ui.Context;
  public context!: t.IFinderContext;

  /**
   * [Lifecycle]
   */

  public componentDidMount() {}

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

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
            <TreeShellTree />
          </ErrorBoundary>
          {this.renderError(error.tree)}
        </div>
        <div {...styles.right}>
          <ErrorBoundary name={'view'}>
            <TreeShellView />
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
