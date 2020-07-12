import { ErrorView } from '@platform/cell.ui/lib/components/Error';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AppManifest, COLORS, css, CssValue, t, time, ui } from '../../common';
import { Icons } from '../Icons';
import { Spinner } from '../primitives';
import { InstallerConfirm, InstallClickEvent } from './Installer.Confirm';
import { DropEvent, InstallerDragTarget } from './Installer.DragTarget';
import { Message } from './Message';
import { installBundle } from './util';

const COUNTDOWN = 1000;

export type IInstallerDialogProps = {
  dir: string;
  files?: t.IHttpClientCellFileUpload[];
  urls?: string[];
  style?: CssValue;
};
export type IInstallerDialogState = {
  loaded?: boolean;
  dir?: string;
  files?: t.IHttpClientCellFileUpload[];
  urls?: string[];
  error?: t.IErrorInfo;
  installed?: boolean;
  isDragOver?: boolean;
  isSpinning?: boolean;
};

export class InstallerDialog extends React.PureComponent<
  IInstallerDialogProps,
  IInstallerDialogState
> {
  public state: IInstallerDialogState = {};
  private state$ = new Subject<Partial<IInstallerDialogState>>();
  private unmounted$ = new Subject<{}>();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    const { dir, files, urls } = this.props;
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    this.prepare({ dir, files, urls });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get files() {
    return this.state.files || [];
  }

  public get dir() {
    return this.state.dir || '';
  }

  public get url() {
    const { urls = [] } = this.state;
    return urls[0] || '';
  }

  public get manifest() {
    return AppManifest.fromFiles(this.files);
  }

  /**
   * [Methods]
   */

  public async prepare(args: {
    dir: string;
    files?: t.IHttpClientCellFileUpload[];
    urls?: string[];
  }) {
    const { dir, urls } = args;
    const files = AppManifest.filterFiles(args.files);
    if (files.length > 50) {
      this.setError(`Too many files. Are you sure you dropped a bundle?`);
      return;
    }
    this.clearError();
    this.state$.next({ files, dir, urls, loaded: true });
  }

  public install = async () => {
    const ctx = this.context;
    const files = this.files;
    const dir = this.dir || '';
    this.state$.next({ isSpinning: true });

    try {
      // Upload the bundle.
      await installBundle({ ctx, dir, files });

      // Display "installed" notification.
      this.state$.next({ installed: true, isSpinning: false });
      time.delay(COUNTDOWN, () => this.close());
    } catch (error) {
      this.setError(error);
    }
  };

  public close() {
    this.context.fire({ type: 'APP:SYS/overlay', payload: { overlay: undefined } });
  }

  private setError = (error: string | Error) => {
    this.state$.next({ error: ErrorView.parseError(error) });
  };

  private clearError() {
    this.state$.next({ error: undefined });
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({ Absolute: 0, display: 'flex' }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        <InstallerDragTarget
          defaultMessage={''}
          onDragOver={this.dragOverHandler(true)}
          onDragLeave={this.dragOverHandler(false)}
          onDrop={this.onDrop}
        />
        {!this.state.isDragOver && this.renderBody()}
      </div>
    );
  }

  private renderSpinner() {
    const styles = {
      base: css({
        Absolute: 0,
        pointerEvents: 'none',
        Flex: 'center-center',
      }),
    };
    return (
      <div {...styles.base}>
        <Spinner />
      </div>
    );
  }

  private renderBody() {
    const { error, isSpinning, loaded } = this.state;
    if (!loaded) {
      return null;
    }

    const { installed } = this.state;
    const manifest = this.manifest;
    const files = this.files;
    const urls = this.state.urls;

    if (error) {
      return this.renderError(error);
    }
    if (isSpinning) {
      return this.renderSpinner();
    }
    if (files.length === 0) {
      return null;
    }

    const styles = {
      base: css({
        flex: 1,
        display: 'flex',
        Flex: 'vertical-center-center',
        pointerEvents: 'none',
      }),
      label: css({
        fontSize: 20,
        fontWeight: 'bolder',
        letterSpacing: -0.8,
        cursor: 'default',
      }),
    };

    const message = installed ? '🎉 Successfully Installed' : '';

    return (
      <div {...styles.base}>
        {message && <Message text={message} countdown={COUNTDOWN} />}
        {!message && (
          <InstallerConfirm
            name={manifest.name}
            version={manifest.version}
            files={files}
            urls={urls}
            onInstallClick={this.onInstallClick}
          />
        )}
      </div>
    );
  }

  private renderError(error: t.IErrorInfo) {
    const styles = {
      base: css({
        position: 'relative',
        Flex: 'center-center',
        flex: 1,
        pointerEvents: 'none',
      }),
      body: css({
        Flex: 'vertical-center-center',
        MarginX: 30,
        marginBottom: '5%',
      }),
      icon: css({ marginBottom: 20 }),
      message: css({
        textAlign: 'center',
      }),
      tryAgain: css({
        marginTop: 10,
        opacity: 0.5,
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.body}>
          <Icons.AlertTriangle color={COLORS.CLI.MAGENTA} size={64} style={styles.icon} />
          <div {...styles.message}>
            <div>{error.message}</div>
            <div {...styles.tryAgain}>Please try again.</div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * [Handlers]
   */

  private dragOverHandler = (isDragOver: boolean) => {
    return () => this.state$.next({ isDragOver });
  };

  private onDrop = (e: DropEvent) => {
    const { dir, files, urls } = e;
    this.state$.next({ isDragOver: false });
    this.prepare({ dir, files, urls });
  };

  private onInstallClick = (e: InstallClickEvent) => {
    console.log('e', e);
    this.install();
  };
}
