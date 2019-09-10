import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { t, css, GlamorValue } from '../../common';
import * as loader from './loader';

export type ImageLoadEventHandler = (e: t.IImageLoad) => void;

/**
 * Renders an curried image.
 */
export type IImageProps = {
  style?: GlamorValue;
  opacity?: number;
  scale?: number;
  origin?: string;
  onLoad?: ImageLoadEventHandler;
};

console.log('TODO - mouse events on img');
/**
 * TODO
 * - mouse event
 * - callback
 * - fadeIn
 */

/**
 * Curry an image src into a JSX element.
 */
export const image = (src: t.ImageSrc) => {
  return (props: IImageProps = {}) => {
    return <ImageView {...props} src={src} style={css(props.style)} />;
  };
};

/**
 * [View]
 */
type IImageViewProps = IImageProps & {
  src: t.ImageSrc;
};
type IImageViewState = {
  isLoaderRendered?: boolean;
};

class ImageView extends React.PureComponent<IImageViewProps, IImageViewState> {
  public state: IImageViewState = {
    isLoaderRendered: Boolean(loader.get(this.props.src)),
  };
  private state$ = new Subject<Partial<IImageViewState>>();
  private unmounted$ = new Subject<{}>();
  private events$ = new Subject<t.ImageEvent>();

  /**
   * [Lifecycle]
   */
  constructor(props: IImageViewProps) {
    super(props);

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

    events$
      // Hide the background loader when fully loaded.
      .pipe(filter(e => !e.payload.isLoading))
      .subscribe(e => {
        const { onLoad } = this.props;
        this.state$.next({ isLoaderRendered: true });
        if (onLoad) {
          onLoad(e.payload);
        }
      });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Methods]
   */
  private fire(e: t.IImageLoadEvent) {
    this.events$.next(e);
  }

  /**
   * [Render]
   */
  public render() {
    const { isLoaderRendered: isLoaderRendered } = this.state;
    const { opacity, scale, origin, src } = this.props;
    const { x1, x2, width, height } = src;
    const transform = typeof scale === 'number' ? `scale(${scale})` : undefined;
    const elLoader = !isLoaderRendered && loader.create(this.props.src, this.events$);
    const styles = {
      base: css({
        Image: [x1, x2, width, height],
        opacity,
        transform,
        transformOrigin: origin,
      }),
    };
    return (
      <div className={'p-image'} {...css(styles.base, this.props.style)}>
        {elLoader}
      </div>
    );
  }
}
