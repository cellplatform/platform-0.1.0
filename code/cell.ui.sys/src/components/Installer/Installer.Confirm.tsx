import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AppManifest, color, COLORS, css, CssValue, filesize, t, ui, semver } from '../../common';
import { Icons } from '../Icons';
import { Button } from '../primitives';

type Version = { from: string; to: string; eq: boolean };
type Action = 'INSTALL' | 'UPGRADE';

export type InstallClickEvent = { version: Version; action: Action };
export type InstallClickEventHandler = (e: InstallClickEvent) => void;

export type IInstallerConfirmProps = {
  name: string;
  version: string;
  files?: t.IHttpClientCellFileUpload[];
  urls?: string[];
  style?: CssValue;
  onInstallClick?: InstallClickEventHandler;
};
export type IInstallerConfirmState = {
  exists?: boolean;
  version?: { from: string; to: string };
};

export class InstallerConfirm extends React.PureComponent<
  IInstallerConfirmProps,
  IInstallerConfirmState
> {
  public state: IInstallerConfirmState = {};
  private state$ = new Subject<Partial<IInstallerConfirmState>>();
  private unmounted$ = new Subject<{}>();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    this.init();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  public componentDidUpdate(prev: IInstallerConfirmProps) {
    const { name, version } = this.props;
    if (prev.name !== name || prev.version !== version) {
      this.init();
    }
  }

  private async init() {
    const { exists, version } = await this.bundle();
    this.state$.next({ exists, version });
  }

  /**
   * [Properties]
   */
  public get files() {
    return this.props.files || [];
  }

  public get url() {
    const { urls = [] } = this.props;
    return urls[0] || '';
  }

  public get manifest() {
    return AppManifest.fromFiles(this.files);
  }

  public get version(): Version {
    const { from = '', to = '' } = this.state.version || {};
    const eq = from && to ? semver.eq(from, to) : false;
    return { from, to, eq };
  }

  public get action(): Action {
    const version = this.version;
    return version.from ? 'UPGRADE' : 'INSTALL';
  }

  /**
   * [Methods]
   */
  public async bundle() {
    const ctx = this.context;
    const client = ctx.client;
    const ns = ctx.window.app.uri.toString();
    return this.manifest.bundle({ client, ns });
  }

  /**
   * [Render]
   */
  public render() {
    if (!this.state.version) {
      return null;
    }

    const styles = {
      base: css({
        Flex: 'horizontal-stretch-stretch',
        boxSizing: 'border-box',
        color: COLORS.DARK,
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
      error: css({
        boxSizing: 'border-box',
        color: COLORS.CLI.MAGENTA,
        maxWidth: 300,
        paddingRight: 20,
      }),
    };

    const version = this.version;
    const error =
      version.eq && `Warning: version ${version.to} of this bundle has already been installed.`;

    return (
      <div {...styles.base}>
        <div {...styles.left}>
          <div {...styles.title}>App Bundle</div>
          {this.renderBundleName()}
          <div {...styles.buttons}>
            {!error && this.renderAction()}
            {error && <div {...styles.error}>{error}</div>}
          </div>
        </div>
        <div {...styles.right}>{this.renderList()}</div>
      </div>
    );
  }

  private renderBundleName() {
    const manifest = this.manifest;
    const version = this.version;
    const styles = {
      base: css({
        Flex: 'horizontal-center-stretch',
      }),
      version: css({
        opacity: 0.2,
      }),
      to: css({
        opacity: 0.8,
        marginLeft: 6,
      }),
    };

    return (
      <div {...styles.base}>
        <div>{manifest.name || 'Unnamed'}</div>
        <div {...styles.version}>@{version.to}</div>
      </div>
    );
  }

  private renderAction() {
    const styles = {
      base: css({
        Flex: 'horizontal-stretch-end',
      }),
      upgrade: css({
        fontSize: 10,
        marginLeft: 6,
        opacity: 0.6,
      }),
    };

    const version = this.version;
    const action = this.action;
    const elUpgrade = action === 'UPGRADE' && (
      <div {...styles.upgrade}>
        from {version.from} to {version.to}
      </div>
    );

    return (
      <div {...styles.base}>
        {this.renderActionButton()}
        {elUpgrade}
      </div>
    );
  }

  private renderActionButton() {
    const { exists } = this.state;
    const styles = {
      base: css({
        backgroundColor: COLORS.BLUE,
        color: COLORS.WHITE,
        border: `solid 1px ${color.format(0.3)}`,
        borderRadius: 3,
        padding: 8,
        PaddingX: 30,
        pointerEvents: 'auto',
      }),
    };
    return (
      <Button onClick={this.onClick}>
        <div {...styles.base}>
          <div>{exists ? 'Upgrade' : 'Install'}</div>
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

  /**
   * [Handlers]
   */

  private onClick = () => {
    const { onInstallClick } = this.props;
    if (onInstallClick) {
      onInstallClick({ version: this.version, action: this.action });
    }
  };
}
