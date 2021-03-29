import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, COLORS, css, CssValue, Schema, t, ui } from '../../common';
import { ViewerInfo } from './File.Info';
import { IViewerListItem, ViewerItemClickEvent, ViewerList } from './File.List';

const pathSort = require('path-sort'); // eslint-disable-line

export type IViewerProps = {
  uri: string;
  style?: CssValue;
};
export type IViewerState = {
  isDragOver?: boolean;
  items?: IViewerListItem[];
  current?: IViewerListItem;
};

export class Viewer extends React.PureComponent<IViewerProps, IViewerState> {
  public state: IViewerState = {};
  private state$ = new Subject<Partial<IViewerState>>();
  private unmounted$ = new Subject<void>();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */
  constructor(props: IViewerProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    this.loadFiles();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  private get client() {
    return this.context.client;
  }

  private get uri() {
    return this.props.uri;
  }

  private get items() {
    const { items = [] } = this.state;
    const names: string[] = pathSort(items.map((item) => item.filename));
    const res = names.map((name) => items.find((item) => item.filename === name));
    return res as IViewerListItem[];
  }

  private get selectedIndex() {
    const { current } = this.state;
    if (current) {
      return this.items.indexOf(current);
    }
    return -1;
  }

  /**
   * [Methods]
   */
  public async loadFiles() {
    const http = this.client.http;
    const urls = Schema.urls(http.origin);

    const cell = http.cell(this.props.uri);
    const res = await cell.fs.list();
    if (res.ok) {
      const items = res.body.map((file) => {
        const url = urls.file(file.uri);
        const fileUrl = url.download.toString();
        const infoUrl = url.info.toString();
        const item: IViewerListItem = { filename: file.filename, fileUrl, infoUrl };
        return item;
      });
      this.state$.next({ items });
      this.ensureSelection();
    }
  }

  private setCurrent(current: IViewerListItem) {
    this.state$.next({ current });
  }

  private ensureSelection() {
    const items = this.items;
    if (!this.state.current && items.length > 0) {
      this.setCurrent(items[0]);
    }
  }

  /**
   * [Render]
   */
  public render() {
    const { isDragOver } = this.state;
    const items = this.items;
    const styles = {
      base: css({
        flex: 1,
        position: 'relative',
        boxSizing: 'border-box',
        userSelect: 'none',
        fontSize: 14,
      }),
      content: css({
        Absolute: 0,
        Flex: 'horizontal-stretch-stretch',
        opacity: isDragOver ? 0.1 : 1,
      }),
      left: css({
        position: 'relative',
        width: 200,
        Flex: 'horizontal-stretch-stretch',
        borderRight: `solid 1px ${color.format(-0.1)}`,
        boxSizing: 'border-box',
      }),
      center: css({ flex: 1, position: 'relative' }),
      right: css({
        width: 250,
        borderLeft: `solid 1px ${color.format(-0.1)}`,
      }),
    };
    return (
      <div
        {...css(styles.base, this.props.style)}
        onDragOver={this.dragHandler(true)}
        onDragLeave={this.dragHandler(false)}
        onMouseLeave={this.dragHandler(false)}
        onDrop={this.onDrop}
      >
        <div {...styles.content}>
          <div {...styles.left}>
            <ViewerList
              items={items}
              selectedIndex={this.selectedIndex}
              onClick={this.onItemClick}
            />
          </div>
          <div {...styles.center}>{this.renderImage()}</div>
          <div {...styles.right}>
            <ViewerInfo item={this.state.current} />
          </div>
        </div>
        {isDragOver && this.renderDragOver()}
      </div>
    );
  }

  private renderImage() {
    const { current } = this.state;
    if (!current || !this.isImage(current)) {
      return null;
    }

    const styles = {
      base: css({
        Absolute: 40,
      }),
      image: css({
        backgroundImage: `url(${current.fileUrl})`,
        Absolute: 0,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.image} />
      </div>
    );
  }

  private renderDragOver() {
    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'center-center',
        pointerEvents: 'none',
        color: COLORS.DARK,
      }),
      content: css({
        padding: 6,
        borderRadius: 10,
        backgroundColor: color.format(1),
        boxShadow: `0 0px 16px 0 ${color.format(-0.1)}`,
        fontSize: 26,
      }),
      border: css({
        border: `dashed 2px ${color.format(-0.2)}`,
        PaddingY: 30,
        PaddingX: 100,
        borderRadius: 6,
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.content}>
          <div {...styles.border}>Drop Files</div>
        </div>
      </div>
    );
  }

  /**
   * [Helpers]
   */

  private isImage(item: IViewerListItem) {
    const extensions = ['.png', '.jpg'];
    return extensions.some((ext) => item.filename.endsWith(ext));
  }

  /**
   * [Handlers]
   */

  private onItemClick = (e: ViewerItemClickEvent) => {
    this.setCurrent(e.item);
  };

  private dragHandler = (isDragOver: boolean) => {
    return (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      this.state$.next({ isDragOver });
    };
  };

  private onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    this.state$.next({ isDragOver: false });

    const cell = this.client.http.cell(this.uri);
    const files = await toFiles(e);

    const payload = await Promise.all(
      files.map(async (file) => {
        const filename = file.name;
        const data = await (file as any).arrayBuffer();
        return { filename, data };
      }),
    );

    await cell.fs.upload(payload);
    await this.loadFiles();

    const first = this.items.find((item) => item.filename === payload[0].filename);
    if (first) {
      this.setCurrent(first);
    }
  };
}

/**
 * [Helpers]
 */

async function toFiles(e: React.DragEvent) {
  const files: File[] = [];

  if (e.dataTransfer.items) {
    // tslint:disable-next-line
    for (let i = 0; i < e.dataTransfer.items.length; i++) {
      if (e.dataTransfer.items[i].kind === 'file') {
        const file = e.dataTransfer.items[i].getAsFile();
        if (file) {
          files.push(file);
        }
      }
    }
  }

  return files;
}
