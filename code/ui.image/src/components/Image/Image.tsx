import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { t, css, mouse, defaultValue } from '../../common';
import * as loader from './loader';

/**
 * Curry an image src into a JSX element.
 */
export const image = (src: t.ImageSrc) => {
  return (props: t.IImageProps = {}) => {
    return <ImageView {...props} src={src} style={css(props.style)} />;
  };
};

/**
 * [View]
 */
type IImageViewProps = t.IImageProps & {
  src: t.ImageSrc;
};
type IImageViewState = {
  isLoaderRendered?: boolean;
  opacity?: number;
};

class ImageView extends React.PureComponent<IImageViewProps, IImageViewState> {
  public state: IImageViewState = {
    isLoaderRendered: Boolean(loader.get(this.props.src)),
    opacity: typeof this.props.fadeIn === 'number' ? 0 : defaultValue(this.props.opacity, 1),
  };
  private state$ = new Subject<Partial<IImageViewState>>();
  private unmounted$ = new Subject<{}>();
  private events$ = new Subject<t.ImageEvent>();
  private mouse: mouse.IMouseHandlers;

  public isLoaded = false;

  /**
   * [Lifecycle]
   */
  constructor(props: IImageViewProps) {
    super(props);
    this.mouse = mouse.fromProps(props);

    // Monitor the loader if it's already in progress.
    const loading = loader.get(this.props.src);
    if (loading) {
      const isReady = loading.status === 'LOADED' || loading.status === 'FAILED';
      if (isReady) {
        // Load is already complete.
        if (loading.payload) {
          this.fire({ type: 'IMAGE/load', payload: { ...loading.payload } });
        }
      } else {
        // Load is in progress - bubble events.
        const events$ = loading.events$.pipe(takeUntil(this.unmounted$));
        events$.subscribe(e => this.fire(e));
      }
    }
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    const events$ = this.events$.pipe(takeUntil(this.unmounted$));

    // Bubble events.
    if (this.props.events$) {
      events$.subscribe(e => (this.props.events$ as Subject<t.ImageEvent>).next(e));
    }

    events$
      // Hide the background loader when fully loaded.
      .pipe(filter(e => !e.payload.isLoading))
      .subscribe(e => {
        this.loaded();
        if (this.props.onLoaded) {
          this.props.onLoaded(e.payload);
        }
      });
  }

  public componentDidUpdate(prev: IImageViewProps) {
    const { opacity } = this.props;
    if (prev.opacity !== opacity) {
      this.state$.next({ opacity });
    }
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get isLoading() {
    return !this.isLoaded;
  }

  /**
   * [Methods]
   */
  private fire(e: t.IImageLoadEvent) {
    this.events$.next(e);
  }

  private loaded() {
    if (!this.isLoaded) {
      this.isLoaded = true;
      const opacity = defaultValue(this.props.opacity, 1);
      this.state$.next({ isLoaderRendered: true, opacity });
    }
  }

  /**
   * [Render]
   */
  public render() {
    const { isLoaderRendered, opacity } = this.state;
    const { scale, origin, src, fadeIn } = this.props;
    const { x1, x2, width, height } = src;
    const transform = typeof scale === 'number' ? `scale(${scale})` : undefined;
    const elLoader = !isLoaderRendered && loader.create(this.props.src, this.events$);
    const styles = {
      base: css({
        Image: [x1, x2, width, height],
        transform,
        transformOrigin: origin,
        opacity,
        transition: typeof fadeIn === 'number' ? `opacity ${fadeIn}ms` : undefined,
      }),
    };
    return (
      <div className={'p-image'} {...css(styles.base, this.props.style)} {...this.mouse.events}>
        {elLoader}
      </div>
    );
  }
}
