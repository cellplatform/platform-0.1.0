import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue, t, Client, Schema } from '../../common';

export type IViewerProps = { uri: string; env: t.IEnv; style?: CssValue };
export type IViewerState = {
  isDragOver?: boolean;
  files?: FileItem[];
  image?: FileItem;
};

type FileItem = { filename: string; url: string };

// const uri = 'cell:sys.tmp:A1';

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
  private get host() {
    return this.props.env.host;
  }

  private get client() {
    const client = Client.http(this.host);
    return client;
  }

  private get uri() {
    return this.props.uri;
  }

  /**
   * [Methods]
   */
  public async loadFiles() {
    const client = this.client;
    const urls = Schema.urls(this.host);

    const cell = client.cell(this.props.uri);
    const res = await cell.files.list();
    if (res.ok) {
      const files = res.body.map(file => {
        const url = urls.file(file.uri).download.toString();
        return { filename: file.filename, url };
      });
      this.state$.next({ files });
    }
  }

  /**
   * [Render]
   */
  public render() {
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
      left: css({ width: 230, display: 'flex', position: 'relative' }),
      right: css({ flex: 1, position: 'relative' }),
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
          <div {...styles.left}>{this.renderFiles()}</div>
          <div {...styles.right}>{this.renderImage()}</div>
        </div>
        {isDragOver && this.renderDragOver()}
      </div>
    );
  }

  private renderFiles() {
    const { files = [] } = this.state;
    if (files.length === 0) {
      return null;
    }
    const styles = {
      base: css({
        flex: 1,
        borderRight: `solid 1px ${color.format(-0.1)}`,
        boxSizing: 'border-box',
        // padding: 8,
      }),
      file: css({
        borderBottom: `solid 1px ${color.format(-0.1)}`,
        PaddingY: 8,
        PaddingX: 8,
        cursor: 'pointer',
      }),
    };

    const elFiles = files.map((file, i) => (
      <div key={i} {...styles.file} onClick={this.fileClickHandler(file)}>
        {file.filename}
      </div>
    ));

    return (
      <div {...styles.base}>
        <div>{elFiles}</div>
      </div>
    );
  }

  private renderImage() {
    const { image } = this.state;
    if (!image) {
      return null;
    }

    const styles = {
      base: css({
        Absolute: 40,
      }),
      image: css({
        backgroundImage: `url(${image.url})`,
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
        PaddingX: 35,
        border: `dashed 2px ${color.format(-0.1)}`,
        borderRadius: 6,
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
   * Handlers
   */

  private fileClickHandler = (file: FileItem) => {
    return () => {
      const extensions = ['.png', '.jpg'];
      const isImage = extensions.some(ext => file.filename.endsWith(ext));

      this.state$.next({ image: isImage ? file : undefined });

      //
      // console.log('filename', filename);
    };
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

    const cell = this.client.cell(this.uri);

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
