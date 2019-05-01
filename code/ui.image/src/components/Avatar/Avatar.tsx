import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue } from '../../common';

export type IAvatarProps = {
  src?: string;
  size?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: number | string;
  block?: boolean;
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

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
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

  private handleImageLoaded = () => this.state$.next({ isLoaded: true });
  private handleImageLoadError = () => this.state$.next({ isLoaded: null });
}
