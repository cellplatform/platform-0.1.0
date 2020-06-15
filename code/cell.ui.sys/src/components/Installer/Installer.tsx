import { DragTarget, DragTargetEvent } from '@platform/cell.ui/lib/components/DragTarget';
import { ErrorView } from '@platform/cell.ui/lib/components/Error';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Button } from '../primitives';

// @ts-ignore
import filesize from 'filesize';

import { color, COLORS, css, CssValue, t, ui } from '../../common';
import { Icons } from '../Icons';
import { uploadApp, getManifest, getApps } from './_tmp';

export type WindowEvent = DragTargetEvent;

export type IInstallerProps = {
  event$?: Subject<WindowEvent>;
  style?: CssValue;
};
export type IInstallerState = {
  isDragOver?: boolean;
  dir?: string;
  files?: t.IHttpClientCellFileUpload[];
  urls?: string[];
  error?: t.IErrorInfo;
};

export class Installer extends React.PureComponent<IInstallerProps, IInstallerState> {
  public state: IInstallerState = {};
  private state$ = new Subject<Partial<IInstallerState>>();
  private unmounted$ = new Subject<{}>();
  private event$ = this.props.event$ || new Subject<WindowEvent>();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    const event$ = this.event$.pipe(takeUntil(this.unmounted$));

    const dragTarget = DragTarget.events(event$);

    dragTarget.over$.subscribe((e) => {
      const { isDragOver } = e;
      this.state$.next({ isDragOver });
    });

    dragTarget.drop$.subscribe(async (e) => {
      const ctx = this.context;
      const { urls, dir } = e;
      const files = e.files
        .filter((file) => !file.filename.endsWith('.DS_Store'))
        .filter((file) => !file.filename.endsWith('.map'))
        .filter((file) => file.data.byteLength > 0);

      const manifest = getManifest(files);
      const { apps } = await getApps(ctx.client);
      const exists = manifest ? Boolean(apps.find((row) => row.name === manifest.name)) : false;
      if (exists) {
        this.setError(`The app '${manifest?.name}' has already been installed.`);
      } else {
        this.state$.next({ files, urls, dir, error: undefined, isDragOver: undefined });
      }
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get files() {
    const { files = [] } = this.state;
    return files;
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

  /**
   * [Methods]
   */
  public resetState = () => {
    this.state$.next({
      error: undefined,
      files: undefined,
      urls: undefined,
      dir: undefined,
    });
  };

  public install = async () => {
    if (!this.isDropped) {
      return;
    }

    const files = this.files;
    const dir = this.dir || '';

    try {
      const ctx = this.context;
      await uploadApp({ ctx, dir, files });
      this.resetState();
    } catch (error) {
      this.setError(error);
    }
  };

  private setError = (error: string | Error) => {
    this.state$.next({ error: ErrorView.parseError(error) });
  };

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
        WebkitAppRegion: 'drag',
        userSelect: 'none',
        display: 'flex',
        color: COLORS.DARK,
      }),
    };

    return (
      <DragTarget style={css(styles.base, this.props.style)} event$={this.event$}>
        {this.renderBody()}
      </DragTarget>
    );
  }

  private renderBody() {
    const { error } = this.state;
    const { isDragOver } = this.state;
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
        fontSize: 24,
        fontWeight: 'bolder',
        letterSpacing: -0.8,
        cursor: 'default',
        pointerEvents: 'none',
      }),
    };

    const message = isDragOver ? `Drop App` : `Drag to Install App`;

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
        Absolute: 50,
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
        marginBottom: 5,
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
          <div {...styles.buttons}>
            <Button onClick={this.install}>Install Now</Button>
          </div>
        </div>
        <div {...styles.right}>{this.renderList()}</div>
      </div>
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
        textAlign: 'right',
        paddingTop: 3,
        fontWeight: 'bolder',
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

    // const elUrl = url && <div {...styles.item}>{url}</div>;

    const totalBytes = files.reduce((acc, next) => acc + next.data.byteLength, 0);

    return (
      <div {...styles.base}>
        {elList}
        <div {...styles.total}>{filesize(totalBytes)}</div>
        {/* {elUrl} */}
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
        opacity: 0.3,
      }),
    };
    return (
      <div {...styles.base}>
        {isDragOver && this.renderDropBorder()}
        {this.renderCloseButton({ onClick: this.resetState })}
        <div {...styles.body}>
          <Icons.AlertTriangle color={COLORS.CLI.YELLOW} size={64} style={styles.icon} />
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
        // cursor: 'pointer',
      }),
    };
    return (
      <Button style={styles.base}>
        <Icons.Close onClick={props.onClick} />
      </Button>
    );
  }
}
