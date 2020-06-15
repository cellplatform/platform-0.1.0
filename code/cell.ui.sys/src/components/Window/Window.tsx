import { DragTarget, DragTargetEvent } from '@platform/cell.ui/lib/components/DragTarget';
import { ErrorView } from '@platform/cell.ui/lib/components/Error';

import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
// import { Temp } from './_Temp';

import { color, COLORS, css, CssValue, t, ui } from '../../common';
import { uploadApp } from './_tmp';

export type WindowEvent = DragTargetEvent;

export type IWindowProps = {
  event$?: Subject<WindowEvent>;
  style?: CssValue;
};
export type IWindowState = {
  isDragOver?: boolean;
  files?: t.IHttpClientCellFileUpload[];
  urls?: string[];
  error?: t.IErrorInfo;
};

export class Window extends React.PureComponent<IWindowProps, IWindowState> {
  public state: IWindowState = {};
  private state$ = new Subject<Partial<IWindowState>>();
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

    // TEMP 🐷
    dragTarget.drop$.subscribe(async (e) => {
      const files = e.files.filter((file) => !file.filename.endsWith('.DS_Store'));
      const { urls, dir } = e;
      this.state$.next({ files, urls, error: undefined });

      try {
        const ctx = this.context;
        await uploadApp({ ctx, dir, files });
      } catch (error) {
        this.state$.next({ error: ErrorView.parseError(error) });
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

  public get url() {
    const { urls = [] } = this.state;
    return urls[0] || '';
  }

  public get isDropped() {
    return this.files.length > 0 || this.url;
  }

  /**
   * [Render]
   */
  public render() {
    const { error } = this.state;
    const ctx = this.context;

    const styles = {
      base: css({
        Absolute: 0,
        WebkitAppRegion: 'drag',
        userSelect: 'none',
        display: 'flex',
        color: COLORS.DARK,
      }),
      def: css({
        Absolute: [null, null, 10, 10],
        fontSize: 10,
        opacity: 0.6,
        textShadow: `0 1px 0px ${color.format(0.3)}`,
      }),
    };

    return (
      <DragTarget style={css(styles.base, this.props.style)} event$={this.event$}>
        {!error && this.renderBody()}
        {error && this.renderError(error)}
        <div {...styles.def}>def → {ctx.def}</div>
      </DragTarget>
    );
  }

  private renderBody() {
    const { isDragOver } = this.state;
    const isDropped = this.isDropped;

    const styles = {
      base: css({ flex: 1, display: 'flex' }),
      border: css({
        Flex: 'vertical-center-center',
        flex: 1,
        boxSizing: 'border-box',
        margin: 50,
        border: `dashed 3px ${color.format(isDragOver && !isDropped ? -0.1 : 0)}`,
        borderRadius: 10,
        pointerEvents: 'none',
      }),
      label: css({
        fontWeight: 'bolder',
        fontSize: 24,
        letterSpacing: -0.8,
        // color: color.format(0.8),
        cursor: 'default',
      }),
    };

    const message = isDragOver ? `Drop App` : `Drag to Install App`;
    const elMessage = !isDropped && <div {...styles.label}>{message}</div>;

    return (
      <div {...styles.base}>
        <div {...styles.border}>
          {elMessage}
          {this.renderList()}
          {/* <Temp /> */}
        </div>
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
      base: css({}),
      item: css({}),
    };

    const elList =
      !url &&
      files.map((file, i) => {
        return (
          <div key={i} {...styles.item}>
            {file.filename}
          </div>
        );
      });

    const elUrl = url && <div {...styles.item}>{url}</div>;

    return (
      <div {...styles.base}>
        {elList}
        {elUrl}
      </div>
    );
  }

  private renderError(error: t.IErrorInfo) {
    return (
      <ErrorView error={error} showStack={false}>
        <div>Please try again.</div>
      </ErrorView>
    );
  }
}
