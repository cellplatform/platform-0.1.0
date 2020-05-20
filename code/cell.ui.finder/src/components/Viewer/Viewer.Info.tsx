import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { COLORS, css, color, CssValue, t, time } from '../../common';

import { IViewerListItem } from './Viewer.List';
import { PropList, IPropListProps, Spinner } from '../primitives';

const filesize = require('pretty-bytes');

export type IViewerInfoProps = {
  env: t.IEnv;
  client: t.IClientTypesystem;
  item?: IViewerListItem;
  style?: CssValue;
};
export type IViewerInfoState = {
  isLoading?: boolean;
  file?: t.IFileData & { createdAt: number; modifiedAt: number };
};

export class ViewerInfo extends React.PureComponent<IViewerInfoProps, IViewerInfoState> {
  public state: IViewerInfoState = {};
  private state$ = new Subject<Partial<IViewerInfoState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IViewerInfoProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    this.loadFileInfo();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  public componentDidUpdate(prevProps: IViewerInfoProps, prevState: IViewerInfoState) {
    const { item } = this.props;
    if (!item?.url || item?.url !== prevProps.item?.url) {
      this.loadFileInfo();
    }
  }

  /**
   * [Properties]
   */
  public get url() {
    return this.props.item?.url || '';
  }

  public get uri() {
    const url = this.url;
    return url ? url.substring(url.lastIndexOf('/') + 1) : '';
  }

  public get items() {
    const { isLoading, file } = this.state;
    if (isLoading || !file) {
      return [];
    }

    const { mimetype, bytes, integrity } = file.props;
    const filehash = integrity?.filehash || '';
    const hash = `${filehash.substring(7, 14)}...${filehash?.substring(filehash.length - 6)}`;

    const createdAt = time.day(file.createdAt);
    const modifiedAt = time.day(file.modifiedAt);
    const format = 'MMM D, YYYY h:mmA';

    const items: IPropListProps['items'] = [
      { label: 'File Size', value: filesize(bytes || 0) },
      { label: 'Created', value: createdAt.format(format) },
      { label: 'Modified', value: modifiedAt.format(format) },
      filehash ? { label: 'Hash (SHA-256)', value: hash, tooltip: filehash } : undefined,
    ];

    return items;
  }

  /**
   * [Methods]
   */
  public async loadFileInfo() {
    const uri = this.uri;
    if (!uri) {
      this.state$.next({ file: undefined });
    } else {
      this.state$.next({ isLoading: true });
      const { client } = this.props;
      const res = await client.http.file(uri).info();
      const { createdAt, modifiedAt } = res.body;
      const file = res.body.data;
      this.state$.next({
        file: { ...file, createdAt, modifiedAt },
        isLoading: false,
      });
    }
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        position: 'relative',
        boxSizing: 'border-box',
        padding: 20,
      }),
    };

    return <div {...css(styles.base, this.props.style)}>{this.renderItem()}</div>;
  }

  private renderItem() {
    const { item } = this.props;
    if (!item) {
      return null;
    }

    const { isLoading } = this.state;

    const styles = {
      base: css({}),
      spinner: css({
        height: 30,
        Flex: 'center-center',
      }),
    };

    const elSpinner = isLoading && (
      <div {...styles.spinner}>
        <Spinner />
      </div>
    );

    return (
      <div {...styles.base}>
        {this.renderPropList()}
        {elSpinner}
      </div>
    );
  }

  private renderPropList() {
    const { item } = this.props;
    const { file } = this.state;
    if (!item || !file) {
      return null;
    }

    const { isLoading } = this.state;
    const items = !isLoading ? this.items : [];

    const styles = {
      base: css({
        boxSizing: 'border-box',
      }),
      thumbnail: css({
        Flex: 'vertical-center-center',
        marginBottom: 36,
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.thumbnail}>{this.renderThumbnail()}</div>
        <PropList title={item.filename} items={items} />
      </div>
    );
  }

  private renderThumbnail() {
    const { file } = this.state;
    if (!file) {
      return null;
    }

    const styles = {
      base: css({
        position: 'relative',
        width: 120,
        backgroundColor: color.format(-0.03),
        borderRadius: 4,
        border: `solid 1px ${color.format(-0.12)}`,
        Flex: 'vertical-center-start',
        boxSizing: 'border-box',
      }),
      icon: css({
        marginTop: 12,
        width: 90,
        height: 90,
        backgroundColor: color.format(1),
        borderRadius: 3,
        border: `solid 1px ${color.format(-0.15)}`,
        backgroundImage: `url(${this.url})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain',
        backgroundPosition: 'center center',
        boxShadow: `inset 0px 1px 3px ${color.format(-0.08)}`,
      }),
      label: css({
        textAlign: 'center',
        fontSize: 11,
        opacity: 0.35,
        MarginY: 8,
        textShadow: `1px 1px 1px ${color.format(1)}`,
      }),
      shadow: css({
        Absolute: [null, 0, -18, 0],
        filter: `blur(4px)`,
        backgroundColor: color.format(-0.1),
        height: 5,
        borderRadius: '100%',
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.shadow} />
        <div>
          <div {...styles.icon} />
        </div>
        <div {...styles.label}>{file.props.mimetype}</div>
      </div>
    );
  }
}
