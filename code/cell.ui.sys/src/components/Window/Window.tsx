import { DragTarget, DragTargetEvent } from '@platform/cell.ui/lib/components/DragTarget';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css, CssValue, t } from '../../common';

export type WindowEvent = DragTargetEvent;

export type IWindowProps = {
  event$?: Subject<WindowEvent>;
  style?: CssValue;
};
export type IWindowState = {
  isDragOver?: boolean;
  files?: t.IHttpClientCellFileUpload[];
  urls?: string[];
};

export class Window extends React.PureComponent<IWindowProps, IWindowState> {
  public state: IWindowState = {};
  private state$ = new Subject<Partial<IWindowState>>();
  private unmounted$ = new Subject<{}>();
  private event$ = this.props.event$ || new Subject<WindowEvent>();

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

    dragTarget.drop$.subscribe((e) => {
      const files = e.files.filter((file) => !file.filename.endsWith('.DS_Store'));
      const urls = e.urls;
      console.log('e', e);
      this.state$.next({ files, urls });
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
    const { isDragOver } = this.state;
    const isDropped = this.isDropped;

    const styles = {
      base: css({
        Absolute: 0,
        WebkitAppRegion: 'drag',
        userSelect: 'none',
        display: 'flex',
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      }),
      target: css({
        Absolute: 0,
      }),
      body: css({
        flex: 1,
        display: 'flex',
      }),
      border: css({
        Flex: 'center-center',
        flex: 1,
        boxSizing: 'border-box',
        margin: 50,
        border: `dashed 3px ${color.format(isDragOver && !isDropped ? 0.4 : 0)}`,
        borderRadius: 10,
        pointerEvents: 'none',
      }),
      label: css({
        fontWeight: 'bolder',
        fontSize: 24,
        letterSpacing: -0.8,
        color: color.format(0.8),
        cursor: 'default',
      }),
    };

    const message = isDragOver ? `Drop App` : `Drag to install App`;
    const elMessage = !isDropped && <div {...styles.label}>{message}</div>;

    return (
      <DragTarget style={css(styles.base, this.props.style)} event$={this.event$}>
        <div {...styles.body}>
          <div {...styles.border}>
            {elMessage}
            {this.renderList()}
          </div>
        </div>
      </DragTarget>
    );
  }

  private renderList() {
    const files = this.files;
    const url = this.url;

    console.log('this.url', this.url);

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
}
