import { DragTarget, DragTargetEvent } from '@platform/cell.ui/lib/components/DragTarget';
import { ErrorView } from '@platform/cell.ui/lib/components/Error';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { getApps, getManifest, uploadApp } from '../../_tmp/tmp.Installer';
import {
  color,
  COLORS,
  css,
  CssValue,
  defaultValue,
  filesize,
  rx,
  t,
  time,
  ui,
  AppManifest,
} from '../../common';
import { Icons } from '../Icons';
import { Button } from '../primitives';

const MIN = {
  WIDTH: 250,
};

export type IInstallerProps = { style?: CssValue };
export type IInstallerState = {
  isDragOver?: boolean;
  dir?: string;
  files?: t.IHttpClientCellFileUpload[];
  urls?: string[];
  error?: t.IErrorInfo;
  installed?: boolean;
  width?: number;
  height?: number;
};

export class Installer extends React.PureComponent<IInstallerProps, IInstallerState> {
  public state: IInstallerState = {};
  private state$ = new Subject<Partial<IInstallerState>>();
  private unmounted$ = new Subject<{}>();
  private drag$ = new Subject<DragTargetEvent>();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  private el!: HTMLDivElement;
  private elRef = (ref: HTMLDivElement) => (this.el = ref);

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    const drag$ = this.drag$.pipe(takeUntil(this.unmounted$));
    const dragTarget = DragTarget.events(drag$);
    const event$ = this.context.event$.pipe(takeUntil(this.unmounted$));

    dragTarget.over$.subscribe((e) => {
      const { isDragOver } = e;
      this.state$.next({ isDragOver });
    });

    dragTarget.drop$.subscribe(async (e) => {
      const { urls, dir, files } = e;
      this.preinstall({ dir, urls, files });
    });

    rx.payload<t.IUiWindowResizeEvent>(event$, 'UI:DOM/window/resize')
      .pipe()
      .subscribe((e) => this.updateSize());
    this.updateSize();
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

  public get isDropped() {
    return this.files.length > 0 || this.url;
  }

  public get manifest() {
    return getManifest(this.files);
  }

  public get size() {
    const width = defaultValue(this.state.width, -1);
    const height = defaultValue(this.state.height, -1);
    return { width, height };
  }

  /**
   * [Methods]
   */
  public updateSize() {
    if (this.el) {
      const width = this.el.offsetWidth;
      const height = this.el.offsetHeight;
      this.state$.next({ width, height });
    }
  }

  public resetState = () => {
    this.state$.next({
      error: undefined,
      files: undefined,
      urls: undefined,
      dir: undefined,
      installed: undefined,
    });
  };

  public async preinstall(args: {
    dir: string;
    files: t.IHttpClientCellFileUpload[];
    urls: string[];
  }) {
    const ctx = this.context;
    const { urls, dir } = args;

    if (args.files.length > 30) {
      this.setError(`Too many files. Are you sure you dropped a bundle?`);
      return;
    }

    const files = args.files
      .filter((file) => !file.filename.endsWith('.DS_Store'))
      .filter((file) => !file.filename.endsWith('.map'))
      .filter((file) => file.data.byteLength > 0);

    console.log('files', files);

    /**
     * TODO 🐷
     * Move this into [cell.schema.apps] - AppManifest
     */

    // if (e.files.length > 30) {
    //   this.setError(`Too many files. Are you sure you dropped a bundle?`);
    //   return;
    // }

    const manifest = getManifest(files);
    const { apps } = await getApps(ctx.client, ctx.window.app.uri.toString());
    const exists = manifest ? Boolean(apps.find((row) => row.name === manifest.name)) : false;
    if (exists) {
      this.setError(`The app '${manifest?.name}' has already been installed.`);
    } else {
      this.state$.next({ files, urls, dir, error: undefined, isDragOver: undefined });
    }
  }

  public install = async () => {
    if (!this.isDropped) {
      return;
    }

    const ctx = this.context;
    const files = this.files;
    const dir = this.dir || '';

    try {
      // AppManifest.ex
      // const manifest = AppManifest.fromFiles(files);

      // Upload the bundle.
      await uploadApp({ ctx, dir, files });

      // Reset state.
      this.resetState();

      // Display "installed" notification.
      this.state$.next({ installed: true });
      time.delay(2500, () => this.state$.next({ installed: undefined }));
    } catch (error) {
      this.setError(error);
    }
  };

  private setError = (error: string | Error) => {
    this.state$.next({ isDragOver: false, error: ErrorView.parseError(error) });
  };

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
      }),
      drag: css({
        WebkitAppRegion: 'drag',
        userSelect: 'none',
        display: 'flex',
        color: COLORS.DARK,
        Absolute: 0,
      }),
    };

    const width = this.size.width;
    const el = width >= MIN.WIDTH && (
      <DragTarget style={styles.drag} event$={this.drag$}>
        {this.renderBody()}
      </DragTarget>
    );

    return (
      <div ref={this.elRef} {...css(styles.base, this.props.style)}>
        {el}
      </div>
    );
  }

  private renderBody() {
    const { error } = this.state;
    const { isDragOver, installed } = this.state;
    const isDropped = this.isDropped;

    if (error) {
      return this.renderError(error);
    }

    const styles = {
      base: css({
        flex: 1,
        display: 'flex',
        Flex: 'vertical-center-center',
      }),
      label: css({
        fontSize: 20,
        fontWeight: 'bolder',
        letterSpacing: -0.8,
        cursor: 'default',
        pointerEvents: 'none',
      }),
    };

    const dropMessage = isDragOver ? `Drop App` : `Drag to Install App`;
    const message = installed ? '🎉 Successfully Installed' : dropMessage;

    return (
      <div {...styles.base}>
        {isDragOver && this.renderDropBorder()}
        {!isDropped && <div {...styles.label}>{message}</div>}
        {isDropped && this.renderInstallConfirm()}
      </div>
    );
  }

  private renderDropBorder() {
    const styles = {
      base: css({
        Absolute: 8,
        border: `dashed 3px ${color.format(-0.1)}`,
        borderRadius: 10,
        pointerEvents: 'none',
      }),
    };
    return <div {...styles.base} />;
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
        {this.renderCloseButton({ onClick: this.resetState })}
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
    const { isDragOver } = this.state;
    const styles = {
      base: css({
        position: 'relative',
        Flex: 'center-center',
        flex: 1,
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
        {isDragOver && this.renderDropBorder()}
        {this.renderCloseButton({ onClick: this.resetState })}
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

  private renderCloseButton(props: { onClick?: () => void } = {}) {
    const styles = {
      base: css({
        Absolute: [10, 10, null, null],
      }),
    };
    return (
      <Button style={styles.base}>
        <Icons.Close onClick={props.onClick} />
      </Button>
    );
  }
}
