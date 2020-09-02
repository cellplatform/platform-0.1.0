import * as React from 'react';
import { Subject, merge } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { defaultValue, color, css, CssValue, t, Module, ui } from '../../common';
import { Cropmarks } from './Host.Cropmarks';

type E = t.HarnessEvent;
type P = t.HarnessProps;

export type IHostProps = IHostPropsRenderer & {
  bus: t.EventBus<any>;
  harness: t.HarnessModule;
  style?: CssValue;
};
export type IHostPropsRenderer = {
  view: string;
  layout?: t.IDevHostLayout;
};

export type IHostState = { node?: t.ITreeNode<P> };

export class Host extends React.PureComponent<IHostProps, IHostState> {
  public state: IHostState = {};
  private state$ = new Subject<Partial<IHostState>>();
  private unmounted$ = new Subject();
  private bus = this.props.bus.type<E>();

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));

    const bus = this.bus;
    const harness = this.harness;
    const fire = Module.fire<P>(bus);

    const match: t.ModuleFilterEvent = (e) => true;
    const events = Module.events<P>(
      Module.filter(bus.event$, match),
      merge(harness.dispose$, this.unmounted$),
    );

    // If the hosted component is not returning an element, render the harness "404".
    events.changed$
      .pipe(
        filter((e) => e.change.to.id === harness.id),
        filter((e) => !this.host?.view.component),
      )
      .subscribe((e) => {
        fire.render({ module: harness, view: '404' });
      });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  private get harness() {
    return this.props.harness;
  }

  private get host() {
    return this.state.node?.props?.data?.host || { view: {} };
  }

  private get layout() {
    // NB: The layout may be "injected" explicity via the renderer
    //     when performing a known layout configuration. Prefer this
    //     when available over the details held on the rendered tree-node,
    //     which may not be avilable if the renderer passed this property.
    return this.props.layout || this.host?.layout || {};
  }

  private get borderColor() {
    const border = defaultValue(this.layout.border, true);
    const value = border === true ? 0.3 : border === false ? 0 : border;
    return color.format(value);
  }

  private get cropmarks() {
    return defaultValue(this.layout.cropmarks, true);
  }

  private get cropmarksColor() {
    const cropmarks = this.cropmarks;
    const value = cropmarks === true ? 1 : cropmarks === false ? 0 : cropmarks;
    return color.format(value);
  }

  /**
   * [Render]
   */
  public render() {
    const layout = this.layout;
    const abs = layout.position?.absolute;

    const styles = {
      base: css({
        position: 'relative',
        flex: 1,
        padding: 30,
        boxSizing: 'border-box',
      }),
      body: css({
        Absolute: 0,
        Flex: abs ? undefined : 'center-center',
      }),
      outer: css({
        position: abs ? 'absolute' : 'relative',
        Absolute: abs ? [abs.top, abs.right, abs.bottom, abs.left] : undefined,
        border: `solid 1px ${this.borderColor}`,
        backgroundColor: color.format(layout.background),
      }),
      frame: css({
        width: layout.width,
        height: layout.height,
        WebkitAppRegion: 'none',
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.body}>
          <div {...styles.outer}>
            {this.renderCropmarks()}
            {this.renderFrame()}
          </div>
        </div>
      </div>
    );
  }

  private renderCropmarks() {
    if (!this.cropmarks) {
      return null;
    }

    const size = 20;
    const margin = 6;
    const offset = size + margin;

    // Ensure the space surrounding an absolute positioning is not less than the cropmark offset.
    const abs = this.layout.position?.absolute;
    if (abs && Object.keys(abs).some((key) => abs[key] < offset)) {
      return null;
    }

    return <Cropmarks color={this.cropmarksColor} margin={margin} size={size} />;
  }

  private renderFrame() {
    const MAIN: t.HarnessTarget = 'Main';
    const layout = this.layout;

    const styles = {
      base: css({
        width: layout.width,
        height: layout.height,
        WebkitAppRegion: 'none',
      }),
    };

    const node = this.state.node;
    const children = (node?.children || [])
      .map((node) => getHost(node)?.view.component as string)
      .filter((view) => Boolean(view));

    const elChildren = children.map((view, i) => {
      return (
        <Host
          key={`child-${i}`}
          bus={this.bus}
          view={view}
          harness={this.harness}
          style={{ Absolute: 0 }}
        />
      );
    });

    return (
      <React.Fragment>
        <ui.ModuleView.Frame
          style={styles.base}
          bus={this.props.bus}
          filter={this.viewFilter}
          target={MAIN}
          debug={false}
          onBeforeRender={this.beforeRender}
        />
        {elChildren}
      </React.Fragment>
    );
  }

  /**
   * Handlers
   */
  private viewFilter: t.ModuleFilterView<t.HarnessView, t.HarnessTarget> = (e) => {
    return e.view === this.props.view;
  };

  /**
   * Before a component renders, capture the configruation
   * details stored about the component on it's module node.
   */
  private beforeRender = (e: t.IModuleRendered<any>) => {
    const module = this.harness.find((child) => child.id === e.module);
    const node = module?.query.find(({ node }) => getHost(node)?.view.component === e.view);
    this.state$.next({ node });
  };
}

/**
 * [Helpers]
 */

const getHost = (node?: t.ITreeNode<P>) => node?.props?.data?.host;
