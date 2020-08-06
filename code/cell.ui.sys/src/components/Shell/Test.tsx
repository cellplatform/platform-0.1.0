import * as React from 'react';
import { Subject } from 'rxjs';

import { COLORS, CssValue } from '../../common';
import { Module } from '../../state.Module';
import { TreeView } from '../primitives';
import { Shell } from './Shell';
import { TestPanel } from './TestPanel';
import * as t from './types';
import { DebugSheet } from '../Debug.Sheet';

export type ITestProps = { style?: CssValue };

export class Test extends React.PureComponent<ITestProps> {
  private unmounted$ = new Subject();

  public module = Module.create<t.MyModuleData, t.MyFooEvent>({
    dispose$: this.unmounted$,
    strategy: Module.strategies.default,
  });

  /**
   * [Lifecycle]
   */

  public async componentDidMount() {
    const module = this.module;
    const actions = module.action(this.unmounted$);

    const SHELL_KEY = 'debug.shell';

    const panel = await Module.register(module, { id: SHELL_KEY, name: 'Shell (Debug Panel)' });
    console.log('panel', panel);

    const sheet = await DebugSheet.register(module);

    // console.log('panel', panel);

    actions.dispatched<t.IModuleRenderEvent>('Module/render').subscribe((e) => {
      const { namespace, key } = Module.identity.parse(e.tree.selection?.id);
      const selected = module.find((args) => args.namespace === namespace);

      // console.log('id', id);

      if (key === SHELL_KEY && selected) {
        const el = <TestPanel root={module} selected={selected} />;
        e.render(el);
      }
    });

    console.log('module.root', module.root);
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    return <Shell module={this.module} style={{ Absolute: 0, backgroundColor: COLORS.WHITE }} />;
  }
}
