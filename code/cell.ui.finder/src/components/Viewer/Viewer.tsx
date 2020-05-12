import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue, t, Client, Schema } from '../../common';

import { ViewerList, IViewerListItem, ViewerItemClickEvent } from './Viewer.List';
import { ViewerInfo } from './Viewer.Info';

export type IViewerProps = {
  uri: string;
  client: t.IClientTypesystem;
  env: t.IEnv;
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
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IViewerProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
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
    return this.props.client;
  }

  private get uri() {
    return this.props.uri;
  }

  /**
   * [Methods]
   */
  public async loadFiles() {
    const http = this.client.http;
    const urls = Schema.urls(http.origin);

    const cell = http.cell(this.props.uri);
    const res = await cell.files.list();
    if (res.ok) {
      const files = res.body.map(file => {
        const url = urls.file(file.uri).download.toString();
        return { filename: file.filename, url };
      });
      this.state$.next({ items: files });
    }
  }

  /**
   * [Render]
   */
  public render() {
    const { env } = this.props;
    const { isDragOver } = this.state;
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
            <ViewerList env={env} items={this.state.items || []} onClick={this.onItemClick} />
          </div>
          <div {...styles.center}>{this.renderImage()}</div>
          <div {...styles.right}>
            <ViewerInfo env={env} client={this.client} item={this.state.current} />
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
        backgroundImage: `url(${current.url})`,
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
      }),
      content: css({
        PaddingY: 10,
        PaddingX: 60,
        border: `dashed 2px ${color.format(-0.1)}`,
        borderRadius: 6,
        backgroundColor: color.format(1),
        boxShadow: `0 0px 16px 0 ${color.format(-0.1)}`,
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.content}>
          <div>Drop Files</div>
        </div>
      </div>
    );
  }

  /**
   * [Helpers]
   */

  private isImage(item: IViewerListItem) {
    const extensions = ['.png', '.jpg'];
    return extensions.some(ext => item.filename.endsWith(ext));
  }

  /**
   * [Handlers]
   */

  private onItemClick = (e: ViewerItemClickEvent) => {
    this.state$.next({ current: e.item });
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
      files.map(async file => {
        const filename = file.name;
        const data = await (file as any).arrayBuffer();
        return { filename, data };
      }),
    );

    await cell.files.upload(payload);

    this.loadFiles();
  };
}

/**
 * [Helpers]
 */

async function toFiles(e: React.DragEvent) {
  const files: File[] = [];
  // const res: { filename: string; data: ArrayBuffer }[] = [];

  if (e.dataTransfer.items) {
    // tslint:disable-next-line
    for (let i = 0; i < e.dataTransfer.items.length; i++) {
      if (e.dataTransfer.items[i].kind === 'file') {
        const file = e.dataTransfer.items[i].getAsFile();
        if (file) {
          files.push(file);
          // const filename = file.name;
          // const data = await (file as any).arrayBuffer();
          // res.push({ filename, data });
        }
      }
    }
  }

  return files;
}
