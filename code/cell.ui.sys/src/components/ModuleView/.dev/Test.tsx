import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { ModuleView } from '..';
import { css, CssValue, time, ui } from '../../../common';
import { Icons } from '../../primitives';
import { ComponentFrame } from './ComponentFrame';
import { TestKong } from './Test.Kong';
import * as t from './types';

const Module = ModuleView.Module;

/**
 * Component
 */
export type ITestProps = { style?: CssValue };
export type ITestState = {
  root?: t.MyModule;
  foo?: t.MyModule;
  bar?: t.MyModule;
  selected?: t.MyModule;
};

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = {};
  private state$ = new Subject<Partial<ITestState>>();
  private unmounted$ = new Subject();
  private treeview$ = new Subject<t.TreeviewEvent>();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    const ctx = this.context;
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));

    const module = Module.create<t.MyModuleData>({
      event$: ctx.event$,
      dispose$: this.unmounted$,
    });

    this.init(module);
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  private async init(root: t.IModule) {
    const ctx = this.context;

    // Publishes module changes into the global event bus.
    Module.publish({
      module: root,
      fire: ctx.fire,
      until$: this.unmounted$,
    });

    const foo = Module.register(root, { id: 'foo', label: 'Diagram' }).module;
    const bar = Module.register(root, { id: 'bar', label: 'Sample' }).module;

    console.log('root:', root.id);
    console.log('foo: ', foo.id);
    console.log('bar: ', bar.id);
    console.log('-------------------------------------------');

    const RootProvider = Module.provider<t.MyContext>({
      event$: ctx.event$,
      fire: ctx.fire as any,
    });

    this.state$.next({ root, foo, bar });

    /**
     * Work with root events.
     */

    // Monitor selection in left-hand tree.
    const rootEvents = Module.events(root, this.unmounted$);

    rootEvents.selection$.subscribe((e) => {
      const selected = root.find((child) => child.id === e.tree.selection?.id);
      this.state$.next({ selected });
    });

    /**
     * Work with global events.
     */
    const globalEvents = Module.events(ctx.event$, this.unmounted$);

    globalEvents.render$.subscribe((e) => {
      if (e.module === foo.id) {
        e.render(this.renderDiagram());
      }
      if (e.module === bar.id) {
        const el = (
          <RootProvider>
            <TestKong e={e} module={bar.id} />
          </RootProvider>
        );
        e.render(el);
      }
    });

    foo.change((draft, ctx) => {
      ctx.props(draft, (props) => {
        props.view = 'MyView'; // TODO - do this at registration
        props.data = { foo: 'foo-view' };
      });
      ctx.children(draft, (children) => {
        children.push(...[{ id: 'one' }, { id: 'two' }]);
      });
    });

    bar.change((draft, ctx) => {
      ctx.props(draft, (props) => {
        props.view = 'MyView'; // TODO - do this at registration
        props.data = { foo: 'bar-view' };
      });
      ctx.children(draft, (children) => {
        children.push({ id: 'zinger' });
        children.push(...[{ id: 'one' }, { id: 'two' }]);
        // children.push({ id: 'sub-tree', props: { treeview: { label: 'Sub-tree' } } });
      });
    });

    time.delay(500, () => {
      bar.change((draft, ctx) => {
        const child = ctx.children(draft)[0];
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
          ];
        }
      });
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
              <ModuleView.Tree module={this.state.root} />
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

  private renderDiagram() {
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

  /**
   * [Handlers]
   */

  private renderFilter: t.ModuleFilter = (args) => {
    return true;
  };
}
