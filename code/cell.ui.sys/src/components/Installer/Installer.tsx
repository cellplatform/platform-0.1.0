import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, t, ui } from '../../common';
import { InstallerDragTarget, DropEvent } from './Installer.DragTarget';

export type IInstallerProps = { style?: CssValue };
export type IInstallerState = {};

export class Installer extends React.PureComponent<IInstallerProps, IInstallerState> {
  public state: IInstallerState = {};
  private state$ = new Subject<Partial<IInstallerState>>();
  private unmounted$ = new Subject();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
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
      base: css({ Absolute: 0 }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <InstallerDragTarget onDrop={this.onInstall} />
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private onInstall = (e: DropEvent) => {
    const { files, urls, dir } = e;
    this.context.fire({
      type: 'APP:SYS/overlay',
      payload: { overlay: { kind: 'INSTALL', dir, files, urls } },
    });
  };
}
