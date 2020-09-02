import { t, Module, DEFAULT, R } from '../common';
import { TypeSystem } from '@platform/cell.typesystem';

type B = t.EventBus;
type P = t.HarnessProps;
type S = string;

type IArgs = { name: string; bus: B; module: t.HarnessModule; parent: string };

/**
 * Represents a single component.
 */
export class DevBuilderComponent implements t.IDevBuilderComponent {
  /**
   * [Lifecycle]
   */
  public static create(args: IArgs): t.IDevBuilderComponent {
    return new DevBuilderComponent(args);
  }

  private constructor(args: IArgs) {
    this.bus = args.bus;
    this.module = args.module;
    this.parent = args.parent;

    // Setup data.
    this.index = (this.root.children || []).length;
    this.change.props((props) => (props.view = 'Host'));
    this.name(args.name).label(args.name);

    // Ensure child nodes are shown with "inline" twisties within the tree.
    if (this.parent !== this.module.id) {
      this.module.change((draft, ctx) => {
        const node = ctx.findById(this.parent);
        if (node) {
          const props = node.props || (node.props = {});
          const treeview = props.treeview || (props.treeview = {});
          const chevron = treeview.chevron || (treeview.chevron = {});
          treeview.inline || (treeview.inline = {});
          chevron.isVisible = true;
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
  private readonly components: t.IDevBuilderComponent[] = [];
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

  public get props(): t.IDevComponentProps {
    const id = this.id;
    const props = (this.root.children || [])[this.index]?.props || {};
    const host = props.data?.host || { view: {} };
    const component = host.component || { name: '' };
    const treeview = props.treeview || {};
    const layout = host.layout || {};
    return R.clone({ id, component, treeview, layout });
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
    return this.change.component((props) => (props.name = value));
  }

  public label(value: string) {
    return this.change.treeview((props) => (props.label = clean(value, DEFAULT.UNTITLED)));
  }

  public width(value: number | string | undefined) {
    return this.change.layout((props) => (props.width = clean(value)));
  }

  public height(value: number | string | undefined) {
    return this.change.layout((props) => (props.height = clean(value)));
  }

  public background(value: number | string | undefined) {
    value = clampColor(clean(value));
    return this.change.layout((props) => (props.background = value));
  }

  public border(value: number | boolean) {
    value = clampColor(value);
    return this.change.layout((props) => (props.border = value));
  }

  public cropmarks(value: number | boolean) {
    value = clampColor(value);
    return this.change.layout((props) => (props.cropmarks = value));
  }

  position(fn: (pos: t.IDevBuilderPosition) => void) {
    type A = NonNullable<t.IDevHostLayoutPosition['absolute']>;

    const setAbsolute = (key: keyof A, value?: number) => {
      this.change.layout((props) => {
        const position = props.position || (props.position = {});
        const absolute = position.absolute || (position.absolute = {});
        absolute[key] = value;
      });
      return absolute;
    };

    const absolute: t.IDevBuilderPositionAbsolute = {
      top: (value) => setAbsolute('top', value),
      right: (value) => setAbsolute('right', value),
      bottom: (value) => setAbsolute('bottom', value),
      left: (value) => setAbsolute('left', value),
      every: (value) => absolute.top(value).right(value).bottom(value).left(value),
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
    name = (name || '').trim();
    const existing = this.components.find((item) => item.props.component.name === name);
    if (existing) {
      return existing;
    }

    const bus = this.bus;
    const module = this.module;
    const parent = this.props.id;
    const component = DevBuilderComponent.create({ name, bus, module, parent });

    this.components.push(component);
    return component;
  }

  /**
   * INTERNAL
   */

  /**
   * Helpers for making immutable changes to the underlying tree data-structures.
   */
  private change = {
    props: (fn: (props: P) => void) => {
      this.module.change((draft, ctx) => {
        const root = ctx.findById(this.root);
        if (root) {
          const index = this.index;
          const children = root.children || (root.children = []);
          const node = children[index] || { id: Module.Identity.slug() };
          const props = node.props || (node.props = {});
          props.view = 'Host';
          fn(props);
          children[index] = node;
        }
      });
      return this;
    },

    treeview: (fn: (props: t.ITreeviewNodeProps) => void) => {
      return this.change.props((props) => fn(props.treeview || (props.treeview = {})));
    },

    host: (fn: (props: t.IDevHost) => void) => {
      return this.change.props((props) => {
        const data = props.data || (props.data = {});
        const host = data.host || (data.host = { view: {} });
        fn(host);
      });
    },

    layout: (fn: (props: t.IDevHostLayout) => void) => {
      return this.change.host((props) => fn(props.layout || (props.layout = {})));
    },

    component: (fn: (props: t.IComponent) => void) => {
      return this.change.host((props) => fn(props.component || (props.component = { name: '' })));
    },
  };
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
