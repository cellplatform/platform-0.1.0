import { TypeSystem } from '@platform/cell.typesystem';

import { DEFAULT, Module, R, t } from '../common';
import { deriveColor, COLORS } from './DevBuilder.color';

type B = t.EventBus;
type P = t.HarnessProps;
type S = string;

type IArgs = { name: string; bus: B; module: t.HarnessModule; parent: string };

/**
 * Represents a single component.
 */
export class DevBuilderComponent implements t.DevBuilderComponent {
  /**
   * [Lifecycle]
   */
  public static create(args: IArgs): t.DevBuilderComponent {
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

  public background(value: number | string | undefined | t.DevBuilderColorEditor) {
    value =
      typeof value === 'function'
        ? deriveColor(value, { color: COLORS.RED, opacity: 0.1 })
        : clampColor(clean(value));
    return this.change.layout((props) => (props.background = value as string));
  }

  public border(value: number | boolean) {
    value = clampColor(value);
    return this.change.layout((props) => (props.border = value));
  }

  public cropmarks(value: number | boolean) {
    value = clampColor(value);
    return this.change.layout((props) => (props.cropmarks = value));
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
