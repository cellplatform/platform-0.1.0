import { ErrorView } from '@platform/cell.ui/lib/components/Error';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AppManifest, color, COLORS, css, CssValue, filesize, t, time, ui } from '../../common';
import { Icons } from '../Icons';
import { Button, Spinner } from '../primitives';
import { DropEvent, InstallerDragTarget } from './Installer.DragTarget';
import { Message } from './Message';
import { installBundle } from './util';

const COUNTDOWN = 1500;

export type IInstallerDialogProps = {
  dir: string;
  files?: t.IHttpClientCellFileUpload[];
  urls?: string[];
  style?: CssValue;
};
export type IInstallerDialogState = {
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
    const ctx = this.context;
    const client = ctx.client;

    const { dir, urls } = args;
    const files = AppManifest.filterFiles(args.files);
    if (files.length > 50) {
      this.setError(`Too many files. Are you sure you dropped a bundle?`);
      return;
    }

    const ns = ctx.window.app.uri.toString();
    const manifest = AppManifest.fromFiles(files);
    const bundle = await manifest.bundle({ client, dir, files, ns });

    if (bundle.exists) {
      this.setError(`The app '${manifest.name}' has already been installed.`);
    } else {
      this.clearError();
      this.state$.next({ files, dir, urls });
    }
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
    const { error, isSpinning } = this.state;
    const { installed } = this.state;

    if (isSpinning) {
      return this.renderSpinner();
    }
    if (error) {
      return this.renderError(error);
    }
    if (this.files.length === 0) {
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
        {/* {this.renderMessage({message})} */}
        {!message && this.renderInstallConfirm()}
      </div>
    );
  }

  private renderMessage(props: { message: string; countdown?: number }) {
    const { message } = props;
    if (!message) {
      return null;
    }
    const styles = {
      base: css({}),
      label: css({
        fontSize: 20,
        fontWeight: 'bolder',
        letterSpacing: -0.8,
        cursor: 'default',
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.label}>{message}</div>
      </div>
    );
  }

  private renderInstallConfirm() {
    const manifest = this.manifest;

    const styles = {
      base: css({
        Flex: 'horizontal-stretch-stretch',
        boxSizing: 'border-box',
      }),
      title: css({
        fontSize: 24,
        fontWeight: 'bolder',
        letterSpacing: -0.8,
        cursor: 'default',
        pointerEvents: 'none',
        marginBottom: 3,
      }),
      left: css({
        minWidth: 250,
        borderRight: `solid 1px ${color.format(-0.1)}`,
      }),
      right: css({
        paddingLeft: 20,
      }),
      buttons: css({
        marginTop: 10,
        borderTop: `solid 1px ${color.format(-0.1)}`,
        Flex: 'horizontal-spaceBetween-center',
        paddingTop: 8,
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.left}>
          <div {...styles.title}>App Bundle</div>
          <div>{manifest?.name || 'Unnamed'}</div>
          <div {...styles.buttons}>{this.renderInstallButton()}</div>
        </div>
        <div {...styles.right}>{this.renderList()}</div>
      </div>
    );
  }

  private renderInstallButton() {
    const styles = {
      base: css({
        backgroundColor: COLORS.BLUE,
        color: COLORS.WHITE,
        border: `solid 1px ${color.format(0.3)}`,
        borderRadius: 3,
        padding: 8,
        PaddingX: 20,
        pointerEvents: 'auto',
      }),
    };
    return (
      <Button onClick={this.install}>
        <div {...styles.base}>
          <div>Install Now</div>
        </div>
      </Button>
    );
  }

  private renderList() {
    const files = this.files;
    const url = this.url;

    if (files.length === 0 && !url) {
      return null;
    }

    const styles = {
      base: css({
        fontSize: 12,
        lineHeight: '1.5em',
      }),
      item: css({
        Flex: 'horizontal-stretch-spaceBetween',
        borderBottom: `dashed 1px ${color.format(-0.1)}`,
      }),
      filename: css({
        marginRight: 30,
      }),
      size: css({
        textAlign: 'right',
      }),
      total: css({
        position: 'relative',
        textAlign: 'right',
        paddingTop: 3,
        fontWeight: 'bolder',
      }),
      totalIcon: css({
        Absolute: [2, -20, null, null],
      }),
    };

    const elList =
      !url &&
      files.map((file, i) => {
        const bytes = file.data.byteLength;
        const size = filesize(bytes);
        return (
          <div key={i} {...styles.item}>
            <div {...styles.filename}>{file.filename}</div>
            <div {...styles.size}>{size}</div>
          </div>
        );
      });

    const totalBytes = files.reduce((acc, next) => acc + next.data.byteLength, 0);

    return (
      <div {...styles.base}>
        {elList}
        <div {...styles.total}>
          <Icons.Squirrel style={styles.totalIcon} size={16} color={COLORS.DARK} />
          <div>{filesize(totalBytes)}</div>
        </div>
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
}
