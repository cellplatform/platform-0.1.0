import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ModuleView } from '..';
import { css, CssValue, time, ui } from '../../../common';
import * as t from './types';
import { ComponentFrame } from './ComponentFrame';
import { Icons } from '../../primitives';

const Module = ModuleView.Module;
import { TestKong } from './Test.Kong';

/**
 * Component
 */
export type ITestProps = { style?: CssValue };
export type ITestState = {
  root?: t.MyModule;
  foo?: t.MyModule;
  bar?: t.MyModule;
  selected?: t.MyModule;
  rootNav?: t.ITreeViewNavigation;
  childNav?: t.ITreeViewNavigation;
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

    /**
     * Setup shared tree-view navigation controller
     * NOTE:
     *    This is done once here as we have multiple tree-views
     *    that are sharing the same `treeview$` event stream.
     *    On a single treeview, we would not want to do this
     *    and the <ModuleView.Tree> component would setup its
     *    own controller automatically.
     */

    const rootNav = ModuleView.Tree.navigation({
      module: root,
      treeview$: this.treeview$,
      dispose$: this.unmounted$,
      fire: ctx.fire,
    });

    this.state$.next({ rootNav, root, foo, bar });

    /**
     * Work with events.
     */

    const events = Module.events(ctx.event$);

    events.render$.subscribe((e) => {
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
        children.push({ id: 'sub-tree', props: { treeview: { label: 'Sub-tree' } } });
      });
    });

    time.delay(1000, () => {
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
          child.children = [{ id: 'my-child-1', props: { treeview: { inline: {} } } }];
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
        // backgroundColor: color.format(1),
        WebkitAppRegion: 'none',
        display: 'flex',
      }),
      main: css({
        position: 'relative',
        flex: 1,
        // backgroundColor: color.format(1),
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
              {this.state.rootNav && (
                <ModuleView.Tree style={styles.fill} nav={this.state.rootNav} tag={'left'} />
              )}
            </ComponentFrame>
          </div>
          <div {...css(styles.tree, { marginRight: MARGIN })}>
            <ComponentFrame name={'ModuleView.Tree'} backgroundColor={bg}>
              {this.state.childNav && (
                <ModuleView.Tree style={styles.fill} nav={this.state.childNav} tag={'left.child'} />
              )}
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
              {this.state.rootNav && (
                <ModuleView.Tree style={styles.fill} nav={this.state.rootNav} tag={'right'} />
              )}
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

  // private rootLens = () => {
  //   const nav = this.state.rootNav;

  //   const selected = nav?.selected;

  //   if (nav) {
  //     const p = nav.query.parent(selected);
  //     console.log('p', p);
  //     // return nav.selected;
  //   }

  //   return nav?.current;
  // };

  private childTreeLens = () => {
    const selected = this.state.rootNav?.selected;
    // return selected;
  };
}
