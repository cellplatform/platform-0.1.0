import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { t, css, time } from '../../common';

type Cache = {
  status: t.ImageLoadStatus;
  events$: Observable<t.IImageLoadEvent>;
  payload?: t.IImageLoad;
};
const CACHE: { [key: string]: Cache } = {};
let elContainer: HTMLDivElement;

/**
 * The root container element
 */
export function containerElement() {
  if (!elContainer) {
    const el = (elContainer = document.createElement('div'));
    const className = 'p-Image-loader';
    el.setAttribute('class', className);
    css.global({
      [`.${className}`]: {
        position: 'absolute',
        top: -99999,
        left: -99999,
        width: 1,
        height: 1,
        overflow: 'hidden',
      },
    });
    document.body.append(el);
  }

  return elContainer;
}

/**
 * Determines if the image is already loaded.
 */
export function create(src: t.ImageSrc, events$: Subject<t.IImageLoadEvent>) {
  const cache: Cache = { status: 'LOADING', events$ };
  const el = (
    <LoaderView src={src} elContainer={containerElement()} events$={events$} cache={cache} />
  );
  CACHE[src.x1] = cache;
  return el;
}

export function get(src: t.ImageSrc) {
  const item = CACHE[src.x1];
  return item ? { ...item } : undefined;
}

/**
 * Retrieve the load status of the given image.
 */
export function status(src: t.ImageSrc): t.ImageLoadStatus | undefined {
  const item = get(src);
  return item ? item.status : undefined;
}

/**
 * Determine if the given image is loaded.
 */
export function isLoaded(src: t.ImageSrc): boolean {
  return status(src) === 'LOADED';
}

// import { css, color, GlamorValue } from '../../common';

type ILoaderViewProps = {
  src: t.ImageSrc;
  elContainer: HTMLDivElement;
  events$: Subject<t.IImageLoadEvent>;
  cache: Cache;
};
type ILoaderViewState = {};

class LoaderView extends React.PureComponent<ILoaderViewProps, ILoaderViewState> {
  public state: ILoaderViewState = {};
  private state$ = new Subject<Partial<ILoaderViewState>>();
  private unmounted$ = new Subject<{}>();
  private status: { [key: string]: t.ImageLoadStatus } = {};
  private startedAt = time.now.timestamp;
  private finishedAt = -1;

  /**
   * [Lifecycle]
   */
  constructor(props: ILoaderViewProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get isLoaded() {
    const { x1, x2 } = this.status;
    return x1 === 'LOADED' && x2 === 'LOADED';
  }

  public get isLoading() {
    const { x1, x2 } = this.status;
    return x1 === 'LOADING' || x1 === undefined || x2 === 'LOADING' || x2 === undefined;
  }

  public get ok() {
    const { x1, x2 } = this.status;
    return x1 !== 'FAILED' || x2 !== 'FAILED';
  }

  public get elapsed() {
    return this.finishedAt === -1
      ? time.now.timestamp - this.startedAt
      : this.finishedAt - this.startedAt;
  }

  private get payload(): t.IImageLoad {
    const { src } = this.props;
    const status = this.status;
    return {
      ok: this.ok,
      isLoaded: this.isLoaded,
      isLoading: this.isLoading,
      elapsed: this.elapsed,
      src,
      x1: status.x1 || 'LOADING',
      x2: status.x2 || 'LOADING',
    };
  }

  /**
   * [Methods]
   */
  private fire(e: t.IImageLoadEvent) {
    this.props.cache.payload = { ...e.payload };
    this.props.events$.next(e);
  }

  /**
   * [Render]
   */
  public render() {
    const { src } = this.props;
    return [this.renderImage('x1', src.x1), this.renderImage('x2', src.x2)];
  }

  private renderImage(resolution: t.ImageResolution, src: string) {
    const el = (
      <img
        src={src}
        onLoad={this.loadHandler(resolution, 'LOADED')}
        onError={this.loadHandler(resolution, 'FAILED')}
      />
    );
    return ReactDOM.createPortal(el, this.props.elContainer);
  }

  /**
   * [Handlers]
   */
  private loadHandler = (resolution: t.ImageResolution, status: t.ImageLoadStatus) => {
    return () => {
      this.status[resolution] = status;
      if (this.isLoaded) {
        this.finishedAt = time.now.timestamp;
      }
      this.fire({ type: 'IMAGE/load', payload: this.payload });
    };
  };
}
