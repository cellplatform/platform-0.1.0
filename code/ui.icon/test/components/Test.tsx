import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Icons } from './Icons';
import { color, css, GlamorValue, Hr, IconGrid, ImageSprite } from './common';

const SAMPLE = require('../images/ImageSprite.test/sample.png');
const SAMPLE2x = require('../images/ImageSprite.test/sample@2x.png');

const MAGENTA = '#F93B76';

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
      top: css({
        Flex: 'horizontal-spaceBetween-center',
      }),
    };

    const icons = Object.keys(Icons).map(name => ({ name, icon: Icons[name] }));

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.top}>
          <Icons.Face size={64} color={MAGENTA} />
          <ImageSprite width={20} height={15} src={SAMPLE} total={{ x: 1, y: 2 }} />
        </div>
        <Hr />
        <IconGrid icons={icons} />
        <Hr />
      </div>
    );
  }
}
