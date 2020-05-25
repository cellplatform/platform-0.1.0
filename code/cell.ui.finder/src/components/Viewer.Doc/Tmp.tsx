import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue, COLORS } from '../../common';

import { Icons } from '../Icons';

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec quam lorem. Praesent fermentum, augue ut porta varius, eros nisl euismod ante, ac suscipit elit libero nec dolor. Morbi magna enim, molestie non arcu id, varius sollicitudin neque. In sed quam mauris. Aenean mi nisl, elementum non arcu quis, ultrices tincidunt augue. Vivamus fermentum iaculis tellus finibus porttitor. Nulla eu purus id dolor auctor suscipit. Integer lacinia sapien at ante tempus volutpat.';

export type ITmpProps = { style?: CssValue };
export type ITmpState = {};

export class Tmp extends React.PureComponent<ITmpProps, ITmpState> {
  public state: ITmpState = {};
  private state$ = new Subject<Partial<ITmpState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: ITmpProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    const radius = 5;
    const borderRadius = `${radius}px ${radius}px 0 0`;

    const toolbarHeight = 40;

    const styles = {
      base: css({
        flex: 1,
        Flex: 'vertical-stretch-stretch',
        backgroundColor: color.format(0.3),
        borderRadius,
        fontSize: 14,
        color: COLORS.DARK,
        boxSizing: 'border-box',
      }),
      toolbar: css({
        Absolute: [0, 0, null, 0],
        height: toolbarHeight,
        borderRadius,
        backgroundColor: color.format(1),
        Flex: 'horizontal-center-spaceBetween',
        paddingLeft: 15,
        paddingRight: 8,
        fontSize: 12,
      }),
      content: css({
        Absolute: [toolbarHeight, 0, 0, 0],
        Scroll: true,
      }),
      header: css({
        position: 'relative',
        height: 400,
        Flex: 'center-center',
      }),
      body: css({
        flex: 1,
        backgroundColor: color.format(1),
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.toolbar}>
          <div>Introduction / Foobar</div>
          <div>
            <Icons.Close size={22} />
          </div>
        </div>
        <div {...styles.content}>
          <div {...styles.header}>
            <Icons.Video color={color.format(1)} size={64} />
            {this.renderVideo()}
          </div>
          <div {...styles.body}>{this.renderBody()}</div>
        </div>
      </div>
    );
  }

  private renderVideo() {
    const styles = {
      base: css({}),
    };
    return (
      <div {...styles.base}>
        <iframe
          src={'https://player.vimeo.com/video/306591184'}
          width={'640'}
          height={'360'}
          frameBorder={'0'}
          allow={'autoplay'}
          allowFullScreen={true}
        ></iframe>
      </div>
    );
  }

  private renderBody() {
    const styles = {
      base: css({
        paddingTop: 120,
        boxSizing: 'border-box',
        PaddingX: 70,
      }),
      headline: css({
        fontWeight: 'bolder',
        fontSize: 36,
      }),
      body: css({
        fontSize: 14,
        lineHeight: '1.9em',
        paddingBottom: 120,
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.headline}>Headline</div>
        <div {...styles.body}>
          <p>{LOREM}</p>
          <p>{LOREM}</p>
          <p>{LOREM}</p>
        </div>
      </div>
    );
  }
}
