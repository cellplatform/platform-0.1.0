import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, ui } from './common';
import { Icons } from '../../components/primitives';
import { ComponentFrame } from './ComponentFrame';

import * as factory from './factory';

import * as t from './types';

const { Module, ModuleView } = ui;

/**
 * Component
 */
export type ITestProps = { style?: CssValue };
export type ITestState = {
  root?: t.MyModule;
  foo?: t.MyModule;
  bar?: t.MyModule;
  selected?: t.MyModule;
  rootStrategy?: t.ITreeviewStrategy;
};

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = {};
  private state$ = new Subject<Partial<ITestState>>();
  private unmounted$ = new Subject();

  public static contextType = ui.Context;
  public context!: t.IEnvContext;

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    const ctx = this.context;
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));

    const root = Module.create<t.MyProps>({
      event$: ctx.event$,
      dispose$: this.unmounted$,
    });

    this.init(root);
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  private async init(root: t.MyModule) {
    const ctx = this.context;

    // Publishes module changes into the global event bus.
    Module.publish({
      module: root,
      fire: ctx.fire,
      until$: this.unmounted$,
    });

    const register = Module.register<t.MyProps>(root);
    const foo = register.add({ id: 'foo', treeview: 'Diagram', view: 'DIAGRAM' }).module;
    const bar = register.add({ id: 'bar', treeview: 'Sample', view: 'SAMPLE' }).module;

    console.log('root:', root.id);
    console.log('foo: ', foo.id);
    console.log('bar: ', bar.id);
    console.log('-------------------------------------------');

    const rootStrategy = ModuleView.Tree.Strategy.default();

    this.state$.next({
      root,
      foo,
      bar,
      rootStrategy,
    });

    /**
     * Work with root events.
     */

    // Monitor selection in left-hand tree.
    const rootEvents = Module.events(root, this.unmounted$);

    rootEvents.selection$.subscribe((e) => {
      const id = e.tree.selection?.id;
      const selected = root.find((child) => child.tree.query.exists(id));
      this.state$.next({ selected });
    });

    /**
     * Setup the render factory.
     */
    factory.renderer({
      fire: ctx.fire,
      event$: ctx.event$,
      until$: this.unmounted$,
    });

    /**
     * Muck around with sample data.
     */
    foo.change((draft, ctx) => {
      ctx.props(draft, (props) => {
        props.data = { foo: 'FOO' };
      });
      ctx.children(draft, (children) => {
        children.push(...[{ id: 'one' }, { id: 'two' }, { id: 'three' }]);
      });
    });

    bar.change((draft, ctx) => {
      ctx.props(draft, (props) => {
        props.data = { foo: 'FOO' };

        // const treeview = props.treeview || (props.treeview = {});
        // treeview.isVisible = false;
      });
      ctx.children(draft, (children) => {
        children.push({ id: 'zinger' });
        children.push(...[{ id: 'one' }, { id: 'two' }, { id: 'three' }]);
        // children.push({ id: 'sub-tree', props: { treeview: { label: 'Sub-tree' } } });
      });
    });

    bar.change((draft, ctx) => {
      const child = ctx.children(draft)[1];
      ctx.props(child, (props) => {
        props.treeview = {
          inline: {},
          chevron: { isVisible: true },
          ...props.treeview,
          label: 'hello',
        };
      });
      if (!child.children) {
        child.children = [
          { id: 'my-child-1', props: { treeview: { label: 'child-1' } } },
          { id: 'my-child-2', props: { treeview: { label: 'child-2' } } },
          { id: 'my-child-3', props: { treeview: { label: 'child-3' } } },
        ];
      }
    });
  }

  /**
   * [Render]
   */
  public render() {
    const ctx = this.context;

    const MARGIN = 40;
    const styles = {
      base: css({
        Absolute: 0,
        display: 'flex',
        boxSizing: 'border-box',
        WebkitAppRegion: 'drag',
      }),
      body: css({
        flex: 1,
        Flex: 'horizontal-stretch-stretch',
        margin: MARGIN,
      }),
      tree: css({
        position: 'relative',
        width: 300,
        WebkitAppRegion: 'none',
        display: 'flex',
      }),
      main: css({
        position: 'relative',
        flex: 1,
        WebkitAppRegion: 'none',
      }),
      fill: css({ Absolute: 0 }),
      iconSettings: css({ Absolute: [8, null, null, 8] }),
    };

    const bg = 1;

    return (
      <div {...css(styles.base, this.props.style)}>
        <Icons.Settings style={styles.iconSettings} size={18} />
        <div {...styles.body}>
          <div {...css(styles.tree, { marginRight: MARGIN })}>
            <ComponentFrame name={'ModuleView.Tree'} backgroundColor={bg}>
              <ModuleView.Tree
                module={this.state.root}
                strategy={this.state.rootStrategy}
                focusOnLoad={true}
              />
            </ComponentFrame>
          </div>
          <div {...css(styles.tree, { marginRight: MARGIN })}>
            <ComponentFrame name={'ModuleView.Tree'} backgroundColor={bg}>
              <ModuleView.Tree module={this.state.selected} />
            </ComponentFrame>
          </div>
          <div {...styles.main}>
            <ComponentFrame name={'ModuleView.Frame'} backgroundColor={bg}>
              <ModuleView.Frame
                style={styles.fill}
                fire={ctx.fire}
                event$={ctx.event$}
                filter={this.renderFilter}
              />
            </ComponentFrame>
          </div>
          <div {...css(styles.tree, { marginLeft: MARGIN })}>
            <ComponentFrame name={'ModuleView.Tree'} backgroundColor={bg} blur={true}>
              <ModuleView.Tree module={this.state.root} />
            </ComponentFrame>
          </div>
        </div>
      </div>
    );
  }

  /**
   * [Handlers]
   */

  private renderFilter: t.ModuleFilter = (args) => {
    return true;
  };
}
