import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, defaultValue } from '../../common';

export type IPageVideoProps = {
  src: string;
  width?: number;
  height?: number;
  allowFullScreen?: boolean;
  autoPlay?: boolean;
  marginY?: number;
  style?: CssValue;
};
export type IPageVideoState = {};

export class PageVideo extends React.PureComponent<IPageVideoProps, IPageVideoState> {
  public state: IPageVideoState = {};
  private state$ = new Subject<Partial<IPageVideoState>>();
  private unmounted$ = new Subject();

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get videoId() {
    return this.props.src.replace(/^https:\/\//, '').replace(/vimeo.com\//, '');
  }

  public get src() {
    const id = this.videoId;
    return id ? `https://player.vimeo.com/video/${id}` : '';
  }

  /**
   * [Render]
   */
  public render() {
    const { width = 640, height = 360 } = this.props;
    const allowFullScreen = defaultValue(this.props.allowFullScreen, true);
    const allow = defaultValue(this.props.autoPlay, true) ? 'autoplay' : '';
    const MarginY = defaultValue(this.props.marginY, 50);
    const src = this.src;

    const styles = {
      base: css({
        MarginY,
        Flex: 'center-center',
        position: 'relative',
        visibility: src ? 'visible' : 'hidden',
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        <iframe
          src={src}
          width={width}
          height={height}
          frameBorder={'0'}
          allow={allow}
          allowFullScreen={allowFullScreen}
        ></iframe>
      </div>
    );
  }
}
