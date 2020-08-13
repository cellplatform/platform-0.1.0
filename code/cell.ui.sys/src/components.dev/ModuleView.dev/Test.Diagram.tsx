import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { COLORS, css, CssValue } from './common';
import * as t from './types';

import { ModuleView } from '@platform/cell.ui/lib/components/ModuleView';
const Module = ModuleView.Module;

export type ITestDiagramProps = {
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
    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'vertical-center-center',
        overflow: 'hidden',
        color: COLORS.DARK,
      }),
      image: css({ width: '90%' }),
    };

    const DIAGRAM = {
      BYBASS: 'https://tdb.sfo2.digitaloceanspaces.com/tmp/framing-bypass.png',
      REDESIGN: 'https://tdb.sfo2.digitaloceanspaces.com/tmp/redesign.png',
      THOUGHT_VECTORS: 'https://tdb.sfo2.digitaloceanspaces.com/tmp/thought-vectors.png',
    };

    const src = DIAGRAM.THOUGHT_VECTORS;

    return (
      <div {...styles.base}>
        <img src={src} {...styles.image} />
      </div>
    );
  }
}
