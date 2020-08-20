import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, CssValue, t } from '../../../common';

export type IFinderImageProps = { style?: CssValue };
export type IFinderImageState = t.Object;

export class FinderImage extends React.PureComponent<IFinderImageProps, IFinderImageState> {
  public state: IFinderImageState = {};
  private state$ = new Subject<Partial<IFinderImageState>>();
  private unmounted$ = new Subject();

  /**
   * [Lifecycle]
   */
  constructor(props: IFinderImageProps) {
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
    const styles = {
      base: css({
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div>FinderImage</div>
      </div>
    );
  }
}
