import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { Icons } from '../../components/primitives';
import { css, CssValue, ui, time } from './common';
import { ComponentFrame } from './ComponentFrame';
import * as factory from './factory';
import { FinderModule } from './modules/FinderModule';
import * as t from './types';

const { Module, ModuleView } = ui;

type P = t.MyProps;

/**
 * Component
 */
export type ITestProps = { style?: CssValue };
export type ITestState = {
  main?: t.MyModule;
  diagram?: t.MyModule;
  sample?: t.MyModule;
  selected?: t.MyModule;
  mainStrategy?: t.ITreeviewStrategy;
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
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    this.init();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * Sample module setup.
   */
  private async init() {
    const bus = this.bus;
    const fire = Module.fire(bus);
    const events = Module.events(bus.event$, this.unmounted$);

    const main = Module.create<P>({ bus, root: 'root' });

    const diagram = Module.create<P>({
      bus,
      root: 'diagram',
      treeview: 'Diagram',
      view: 'DIAGRAM',
    });
    const sample = Module.create<P>({ bus, root: 'sample', treeview: 'Sample', view: 'SAMPLE' });

    Module.register(bus, diagram, main.id);
    Module.register(bus, sample, main.id);

    console.log('root:', main.id);
    console.log('foo: ', diagram.id);
    console.log('bar: ', sample.id);
    console.log('-------------------------------------------');

    const mainStrategy = ModuleView.Tree.Strategy.default(); // Sample passing in behavior strategy.

    // Catch un-targetted (wildcard) registrations and route then into the MAIN module.
    events.register$.pipe(filter((e) => !e.parent)).subscribe((e) => {
      const module = fire.request(e.module).module;
      if (module) {
        Module.register(bus, module, main.id);
      }
    });

    this.state$.next({ main, diagram, sample, mainStrategy });

    /**
     * Simulate a module registering itself.
     * NOTE:
     *   This would typically be through some other boot-up process where
     *   the module is pulled then spins itself up and registers itself.
     */
    FinderModule.initialize(bus);

    /**
     * Work with root events.
     */

    // Monitor selection in left-hand tree.
    const mainEvents = Module.events(main, this.unmounted$);

    mainEvents.selection$.subscribe((e) => {
      const id = e.tree.selection?.id;
      const selected = main.find((child) => child.tree.query.exists(id));
      this.state$.next({ selected });

      /**
       * Controller causes frame(s) to re-render.
       */
      if (selected) {
        const props = selected.root.props || {};
        const module = selected.id;
        const { view, data } = props;
        time.delay(0, () => {
          fire.render({ module, view, data, selected: id });
        });
      }
    });

    /**
     * Setup the render factory.
     */
    factory.renderer({ bus, until$: this.unmounted$ });

    /**
     * Muck around with sample data.
     */
    diagram.change((draft, ctx) => {
      ctx.props(draft, (props) => {
        props.data = { foo: 'FOO' };
      });
      ctx.children(draft, (children) => {
        children.push(...[{ id: 'one' }, { id: 'two' }, { id: 'three' }]);
      });
    });

    sample.change((draft, ctx) => {
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

    sample.change((draft, ctx) => {
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
   * [Properties]
   */
  public get bus(): t.EventBus<any> {
    const { event$, fire } = this.context;
    return { event$, fire };
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
    const bus = this.bus;

    return (
      <div {...css(styles.base, this.props.style)}>
        <Icons.Settings style={styles.iconSettings} size={18} />
        <div {...styles.body}>
          <div {...css(styles.tree, { marginRight: MARGIN })}>
            <ComponentFrame name={'ModuleView.Tree'} backgroundColor={bg}>
              <ModuleView.Tree
                module={this.state.main}
                strategy={this.state.mainStrategy}
                focusOnLoad={true}
              />
            </ComponentFrame>
          </div>
          {/* <div {...css(styles.tree, { marginRight: MARGIN })}>
            <ComponentFrame name={'ModuleView.Frame (Root Tree)'} backgroundColor={bg}>
              <ModuleView.Frame bus={bus} filter={this.rootTreeFilter} />
            </ComponentFrame>
          </div> */}
          <div {...css(styles.tree, { marginRight: MARGIN })}>
            <ComponentFrame name={'ModuleView.Tree'} backgroundColor={bg}>
              <ModuleView.Tree module={this.state.selected} />
            </ComponentFrame>
          </div>
          <div {...styles.main}>
            <ComponentFrame name={'ModuleView.Frame'} backgroundColor={bg}>
              <ModuleView.Frame
                style={styles.fill}
                bus={bus}
                // module={this.state.selected?.id}
                filter={this.mainFrameFilter}
              />
            </ComponentFrame>
          </div>
          <div {...css(styles.tree, { marginLeft: MARGIN })}>
            <ComponentFrame name={'ModuleView.Tree'} backgroundColor={bg} blur={true}>
              <ModuleView.Tree module={this.state.main} />
            </ComponentFrame>
          </div>
        </div>
      </div>
    );
  }

  /**
   * [Handlers]
   */

  private mainFrameFilter: t.ModuleFilterView = (e) => {
    return true;
  };
}
