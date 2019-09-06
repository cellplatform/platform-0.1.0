import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { t, css, GlamorValue } from '../../common';

export type ImageLoadEvent = { ok: boolean; error?: Error };
export type ImageLoadEventHandler = (e: ImageLoadEvent) => void;

/**
 * Renders an curried image.
 */
export type IImageProps = {
  style?: GlamorValue;
  opacity?: number;
  scale?: number;
  origin?: string;
};
export type IImageState = {};

/**
 * Curry an image src into a JSX element.
 */
export const image = (src: t.ImageSrc) => {
  const { x1, x2, width, height } = src;
  const style = css({ Image: [x1, x2, width, height] });
  return (props: IImageProps = {}) => {
    return <Image style={css(style, props.style)} />;
  };
};

class Image extends React.PureComponent<IImageProps, IImageState> {
  public state: IImageState = {};
  private state$ = new Subject<Partial<IImageState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IImageProps) {
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
   * [Render]
   */
  public render() {
    const { opacity, scale, origin } = this.props;
    const transform = typeof scale === 'number' ? `scale(${scale})` : undefined;
    const styles = {
      base: css({
        opacity,
        transform,
        transformOrigin: origin,
      }),
    };
    return <div {...css(styles.base, this.props.style)} />;
  }
}
