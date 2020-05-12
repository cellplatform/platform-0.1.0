import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue, t, time, filesize } from '../../common';

import { IViewerListItem } from './Viewer.List';
import { PropList, IPropListProps, Spinner } from '../primitives';

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
  public get uri() {
    const url = this.props.item?.url;
    return url ? url.substring(url.lastIndexOf('/') + 1) : '';
  }

  public get items() {
    const { isLoading, file } = this.state;
    if (isLoading || !file) {
      return [];
    }

    const { mimetype, bytes, integrity } = file.props;
    const filehash = integrity?.filehash || '';
    const hash = `${filehash.substring(7, 14)}[..]${filehash?.substring(filehash.length - 6)}`;

    const createdAt = time.day(file.createdAt);
    const modifiedAt = time.day(file.modifiedAt);
    const format = 'ddd, MMM D, YYYY h:mm A';

    const items: IPropListProps['items'] = [
      { label: 'Size', value: filesize(bytes || 0) },
      { label: 'Kind', value: mimetype },
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
    const { item } = this.props;
    const styles = {
      base: css({
        position: 'relative',
        boxSizing: 'border-box',
        padding: 15,
        paddingTop: 20,
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

    const items = !isLoading ? this.items : [];

    return (
      <div {...styles.base}>
        <PropList title={item.filename} items={items} />
        {elSpinner}
      </div>
    );
  }
}
