import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, CssValue } from '../../common';
import * as t from './types';

import { ModuleView } from '@platform/cell.ui/lib/components/ModuleView';
const Module = ModuleView.Module;

export type ITestDiagramProps = {
  module: string;
  style?: CssValue;
};
export type ITestDiagramState = t.Object;

export class TestDiagram extends React.PureComponent<ITestDiagramProps, ITestDiagramState> {
  public state: ITestDiagramState = {};
  private state$ = new Subject<Partial<ITestDiagramState>>();
  private unmounted$ = new Subject();

  public static contextType = Module.Context;
  public context!: t.MyContext;

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
   * [Render]
   */
  public render() {
    const PINK = '#FE0168';
    const styles = {
      base: css({
        Absolute: 0,
        border: `solid 10px ${PINK}`,
        Flex: 'vertical-center-center',
        overflow: 'hidden',
      }),
      image: css({ width: '80%' }),
    };

    const DIAGRAM = {
      BYBASS: 'https://tdb.sfo2.digitaloceanspaces.com/tmp/framing-bypass.png',
      REDESIGN: 'https://tdb.sfo2.digitaloceanspaces.com/tmp/redesign.png',
    };

    const src = DIAGRAM.REDESIGN;

    return (
      <div {...styles.base}>
        <img src={src} {...styles.image} />
      </div>
    );
  }
}
