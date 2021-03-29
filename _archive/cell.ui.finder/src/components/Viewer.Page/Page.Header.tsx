import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { COLORS, css, color, CssValue, defaultValue } from '../../common';
import { Icons } from '../Icons';
import { Button } from '../primitives';

export type HeaderToolClickEvent = { tool: 'CLOSE' };
export type HeaderToolClickEventHandler = (e: HeaderToolClickEvent) => void;

export type IPageHeaderProps = {
  title?: React.ReactNode;
  radius?: number;
  style?: CssValue;
  onToolClick?: HeaderToolClickEventHandler;
};
export type IPageHeaderState = {};

export class PageHeader extends React.PureComponent<IPageHeaderProps, IPageHeaderState> {
  public static height = 40;

  public state: IPageHeaderState = {};
  private state$ = new Subject<Partial<IPageHeaderState>>();
  private unmounted$ = new Subject<void>();

  /**
   * [Lifecycle]
   */
  constructor(props: IPageHeaderProps) {
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
   * [Properties]
   */
  public get title() {
    const { title } = this.props;
    return title === undefined ? 'Untitled' : title;
  }

  /**
   * [Render]
   */
  public render() {
    const radius = defaultValue(this.props.radius, 5);
    const borderRadius = `${radius}px ${radius}px 0 0`;
    const height = PageHeader.height;

    const styles = {
      base: css({
        Absolute: [0, 0, null, 0],
        height,
        borderRadius,
        backgroundColor: color.format(1),
        Flex: 'horizontal-center-spaceBetween',
        paddingLeft: 15,
        paddingRight: 8,
        fontSize: 12,
      }),
      title: css({
        color: color.format(-0.7),
      }),
      tools: css({
        opacity: 0.7,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.title}>{this.title}</div>
        <div {...styles.tools}>
          <Button onClick={this.toolClickHandler('CLOSE')}>
            <Icons.Close size={22} color={COLORS.DARK} />
          </Button>
        </div>
      </div>
    );
  }

  /**
   * [Handlers]
   */

  private toolClickHandler = (tool: HeaderToolClickEvent['tool']) => {
    return () => {
      const { onToolClick } = this.props;
      if (onToolClick) {
        onToolClick({ tool });
      }
    };
  };
}
