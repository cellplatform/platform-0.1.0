import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue, IconGrid, Hr } from './common';

import { Icons, IIconProps } from './Icons';

// import { part } from '';

export type ITestProps = { style?: GlamorValue };
export type ITestState = {};

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestState>>();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        padding: 30,
      }),
    };

    const icons = Object.keys(Icons).map(name => ({ name, icon: Icons[name] }));
    // return <IconGrid icons={icons} />;

    return (
      <div {...css(styles.base, this.props.style)}>
        <IconGrid icons={icons} />

        <Hr />
      </div>
    );
  }
}
