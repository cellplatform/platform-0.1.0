import { TypeSystem } from '@platform/cell.typesystem';

import { DEFAULT, Module, R, t } from '../common';
import { COLORS, deriveColor } from './DevBuilder.color';
import { changer } from './util';

type B = t.EventBus;
type P = t.HarnessProps;

type IArgs = { name: string; bus: B; module: t.HarnessModule; parent: string };

/**
 * Represents a single component.
 */
export class DevBuilderComponent implements t.DevBuilderComponent {
  /**
   * [Lifecycle]
   */
  public static create(
    args: IArgs,
    options: { existing?: t.DevBuilderComponent[] } = {},
  ): t.DevBuilderComponent {
    if (options.existing) {
      const name = (args.name || '').trim();
      const existing = options.existing.find((item) => item.props.component.name === name);
      if (existing) {
        return existing;
      }
    }

    const res = new DevBuilderComponent(args);

    if (options.existing) {
      options.existing.push(res);
    }
    return res;
  }

  private constructor(args: IArgs) {
    this.bus = args.bus;
    this.module = args.module;
    this.parent = args.parent;

    // Setup data.
    this.index = (this.root.children || []).length;
    this.change.props((props) => (props.view = 'Host'));
    this.change.data((data) => (data.kind = 'harness.component'));
    this.name(args.name).label(args.name);

    // Ensure child nodes are shown with "inline" twisties within the tree.
    if (this.parent !== this.module.id) {
      this.module.change((draft, ctx) => {
        const node = ctx.findById(this.parent);
        if (node) {
          const props = node.props || (node.props = {});
          const treeview = props.treeview || (props.treeview = {});
          treeview.inline || (treeview.inline = {});
        }
      });
    }

    // Setup events.
    const match: t.ModuleFilterEvent = (e) => e.module == this.module.id;
    this.events = Module.events<P>(Module.filter(this.bus.event$, match), this.module.dispose$);
  }

  /**
   * [Fields]
   */
  private readonly parent: string;
  private readonly index: number;
  private readonly bus: B;
  private readonly module: t.HarnessModule;
  private readonly events: t.IViewModuleEvents<any>;
  private readonly components: t.DevBuilderComponent[] = [];
  private readonly view: NonNullable<t.IDevHost['view']> = {
    component: `component-${Module.Identity.slug()}`,
    sidebar: `sidebar-${Module.Identity.slug()}`,
  };

  /**
   * [Properties]
   */
  private get root() {
    return this.module.query.findById(this.parent) as t.ITreeNode<P>;
  }

  public get id() {
    return (this.root.children || [])[this.index]?.id || '';
  }

  public get props(): t.DevBuilderComponentProps {
    const id = this.id;
    const props = (this.root.children || [])[this.index]?.props || {};
    const data = props?.data as t.HarnessDataComponent;
    const host = data?.host || { view: {} };
    const component = host.component || { name: '' };
    const treeview = props.treeview || {};
    const layout = host.layout || {};
    return R.clone({ id, component, treeview, layout });
  }

  private get change() {
    const methods = changer<t.HarnessDataComponent>({
      index: this.index,
      module: this.module,
      root: this.root,
    });

    const host = (fn: (props: t.IDevHost) => void) => {
      return methods.data((data) => {
        const host = data.host || (data.host = { view: {} });
        fn(host);
      });
    };

    const layout = (fn: (props: t.IDevHostLayout) => void) => {
      return host((props) => fn(props.layout || (props.layout = {})));
    };

    const component = (fn: (props: t.IComponent) => void) => {
      return host((props) => fn(props.component || (props.component = { name: '' })));
    };

    return { ...methods, host, layout, component };
  }

  /**
   * [Methods]
   */
  public name(value: string) {
    value = (value || '').trim();
    const { error } = TypeSystem.TypeScript.validate.objectTypename(value);
    if (error) {
      throw new Error(`Invalid component name. ${error}`);
    }
    this.change.component((props) => (props.name = value));
    return this;
  }

  public label(value: string) {
    this.change.treeview((props) => (props.label = clean(value, DEFAULT.UNTITLED)));
    return this;
  }

  public width(value: number | string | undefined) {
    this.change.layout((props) => (props.width = clean(value)));
    return this;
  }

  public height(value: number | string | undefined) {
    this.change.layout((props) => (props.height = clean(value)));
    return this;
  }

  public background(value: number | string | undefined | t.DevBuilderColorEditor) {
    value =
      typeof value === 'function'
        ? deriveColor(value, { color: COLORS.RED, opacity: 0.1 })
        : clampColor(clean(value));
    this.change.layout((props) => (props.background = value as string));
    return this;
  }

  public border(value: number | boolean | t.DevBuilderColorEditor) {
    const border =
      typeof value === 'function'
        ? deriveColor(value, { color: COLORS.WHITE, opacity: 0.3 })
        : clampColor(value);

    this.change.layout((props) => (props.border = border));
    return this;
  }

  public cropmarks(value: number | boolean) {
    value = clampColor(value);
    this.change.layout((props) => (props.cropmarks = value));
    return this;
  }

  position(fn: (pos: t.DevBuilderPosition) => void) {
    type A = t.IDevHostLayoutAbsolute;

    const change = (fn: (position: t.IDevHostLayoutPosition) => void) => {
      this.change.layout((props) => {
        const position = props.position || (props.position = {});
        fn(position);
      });
    };

    const setAbsoluteKey = (key: keyof A, value?: number) => {
      change((pos) => {
        const abs = pos.absolute || (pos.absolute = {});
        abs[key] = value;
        if (Object.keys(abs).every((key) => abs[key] === undefined)) {
          delete pos.absolute; // NB: All values empty - remove the object.
        }
      });
      return absolute;
    };

    const absolute: t.DevBuilderPositionAbsolute = {
      top: (value) => setAbsoluteKey('top', value),
      right: (value) => setAbsoluteKey('right', value),
      bottom: (value) => setAbsoluteKey('bottom', value),
      left: (value) => setAbsoluteKey('left', value),
      x: (value) => absolute.left(value).right(value),
      y: (value) => absolute.top(value).bottom(value),
      xy: (value) => absolute.x(value).y(value),
    };

    fn({ absolute });

    return this;
  }

  public render(fn: t.DevRenderComponent) {
    this.change.host((props) => (props.view = this.view));
    this.events.render(this.view.component).subscribe((e) => {
      const ctx: t.DevRenderContext = {};
      e.render(fn(ctx) || null);
    });
    return this;
  }

  public sidebar(fn: t.DevRenderSidebar) {
    this.change.host((props) => (props.view = this.view));
    this.events.render(this.view.sidebar).subscribe((e) => {
      const ctx: t.DevRenderContext = {};
      e.render(fn(ctx) || null);
    });
    return this;
  }

  public component(name: string) {
    return DevBuilderComponent.create(
      { name, bus: this.bus, module: this.module, parent: this.id },
      { existing: this.components },
    );
  }
}

/**
 * HELPERS
 */

function clean<T>(input: T, defaultValue?: T) {
  if (input === undefined && defaultValue !== undefined) {
    return defaultValue;
  }

  if (typeof input === 'string') {
    return (input || '').trim();
  }

  return input;
}

function clampColor<T>(value: T) {
  if (typeof value === 'number') {
    return Math.max(-1, Math.min(1, value));
  }
  return value;
}
