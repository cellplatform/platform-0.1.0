import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { t, css, color, GlamorValue } from '../../common';

export type IAvatarProps = {
  src?: string;
  size?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: number | string;
  block?: boolean;
  events$?: Subject<t.AvatarEvent>;
  style?: GlamorValue;
};
export type IAvatarState = {
  isLoaded?: boolean | null;
};

/**
 * A picture of a user.
 */
export class Avatar extends React.PureComponent<IAvatarProps, IAvatarState> {
  public state: IAvatarState = { isLoaded: false };
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<IAvatarState>>();
  private events$ = new Subject<t.AvatarEvent>();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    const events$ = this.events$.pipe(takeUntil(this.unmounted$));

    if (this.props.events$) {
      events$.subscribe(this.props.events$);
    }
    this.fireLoad('LOADING');
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get src() {
    return this.props.src || '';
  }

  /**
   * [Render]
   */
  public render() {
    const {
      style,
      src,
      borderColor = 0.4,
      borderWidth = 0,
      size = 36,
      borderRadius = 5,
      block = false,
    } = this.props;

    const imageWidth = size - borderWidth * 2;

    const styles = {
      base: css({
        position: 'relative',
        overflow: 'hidden',
        display: block ? 'block' : 'inline-block',
        width: size,
        height: size,
        backgroundColor: typeof borderColor === 'string' ? borderColor : color.format(borderColor),
        borderRadius: borderRadius,
      }),
      imageOuter: css({
        overflow: 'hidden',
        Absolute: [borderWidth, null, null, borderWidth],
        width: imageWidth,
        height: imageWidth,
        borderRadius: borderRadius - borderWidth * 0.75,
        backgroundImage: `url(${src})`,
        backgroundSize: 'contain',
        display: this.state.isLoaded ? 'block' : 'none',
      }),
      image: css({
        width: 1,
        height: 1,
        visibility: 'hidden',
      }),
    };

    return (
      <div {...css(styles.base, style)}>
        <div {...styles.imageOuter}>
          <img
            src={src}
            {...styles.image}
            onLoad={this.handleImageLoaded}
            onError={this.handleImageLoadError}
          />
        </div>
      </div>
    );
  }

  private handleImageLoaded = () => {
    this.state$.next({ isLoaded: true });
    this.fireLoad('LOADED');
  };
  private handleImageLoadError = () => {
    this.state$.next({ isLoaded: null });
    this.fireLoad('LOAD_FAILED');
  };

  private fire(e: t.AvatarEvent) {
    this.events$.next(e);
  }
  private fireLoad(status: t.AvatarLoadStatus) {
    const src = this.src;
    this.fire({ type: 'AVATAR/load', payload: { status, src } });
  }
}
