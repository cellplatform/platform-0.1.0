import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, CssValue, COLORS, color } from '../../common';
import { Module } from '../../state.Module';

import * as t from './types';

export type IDebugSheetProps = {
  module: t.DebugSheetModule;
  style?: CssValue;
};

export class DebugSheet extends React.PureComponent<IDebugSheetProps> {
  private unmounted$ = new Subject();

  public static async register(within: t.IModule) {
    const module = await Module.register(within, { id: 'debug.sheet', name: 'Sheet' });

    console.log('sheet', module);

    return module;
  }

  /**
   * [Lifecycle]
   */

  public componentDidMount() {}

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
        backgroundColor: COLORS.WHITE,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div>Sheet</div>
      </div>
    );
  }
}
