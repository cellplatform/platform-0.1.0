import { t, Module, DEFAULT, R } from '../common';
import { TypeSystem } from '@platform/cell.typesystem';

type B = t.EventBus;
type P = t.HarnessProps;
type S = string;

type IArgs = { name: string; bus: B; module: t.HarnessModule };

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

    const children = this.module.root.children || [];
    this.index = children.length;

    this.change((props) => (props.view = 'Host/component'));
    this.name(args.name).label(args.name);

    const match: t.ModuleFilterEvent = (e) => e.module == this.module.id;
    this.events = Module.events<P>(Module.filter(this.bus.event$, match), this.module.dispose$);
  }

  /**
   * [Fields]
   */

  private readonly index: number;
  private readonly bus: B;
  private readonly module: t.HarnessModule;
  private readonly events: t.IViewModuleEvents<any>;
  private readonly view: NonNullable<t.IDevHost['view']> = {
    component: `component-${Module.Identity.slug()}`,
    sidebar: `sidebar-${Module.Identity.slug()}`,
  };

  /**
   * [Properties]
   */

  public get props(): t.IDevComponentProps {
    const children = this.module.root.children || [];
    const props = children[this.index]?.props || {};
    const host = props.data?.host || { view: {} };
    const component = host.component || { name: '' };
    const treeview = props.treeview || {};
    const layout = host.layout || {};
    return R.clone({ component, treeview, layout });
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
    return this.component((props) => (props.name = value));
  }

  public label(value: string) {
    return this.treeview((props) => (props.label = clean(value, DEFAULT.UNTITLED)));
  }

  public width(value: number | string | undefined) {
    return this.layout((props) => (props.width = clean(value)));
  }

  public height(value: number | string | undefined) {
    return this.layout((props) => (props.height = clean(value)));
  }

  public background(value: number | string | undefined) {
    return this.layout((props) => (props.background = clean(value)));
  }

  public border(value: number | boolean) {
    return this.layout((props) => (props.border = value));
  }

  public cropMarks(value: number | boolean) {
    return this.layout((props) => (props.cropMarks = value));
  }

  public render(fn: t.DevRenderComponent) {
    this.host((props) => (props.view = this.view));
    this.events.render(this.view.component).subscribe((e) => {
      const ctx: t.DevRenderContext = {};
      e.render(fn(ctx) || null);
    });
    return this;
  }

  public sidebar(fn: t.DevRenderSidebar) {
    this.host((props) => (props.view = this.view));
    this.events.render(this.view.sidebar).subscribe((e) => {
      const ctx: t.DevRenderContext = {};
      e.render(fn(ctx) || null);
    });
    return this;
  }

  /**
   * [Internal]
   */

  private change(fn: (props: P) => void) {
    this.module.change((draft) => {
      const index = this.index;
      const children = draft.children || (draft.children = []);
      const node = children[index] || { id: Module.Identity.slug() };
      const props = node.props || (node.props = {});
      props.view = 'Host/component';
      fn(props);
      children[index] = node;
    });
    return this;
  }

  private treeview(fn: (props: t.ITreeviewNodeProps) => void) {
    this.change((props) => fn(props.treeview || (props.treeview = {})));
    return this;
  }

  private host(fn: (props: t.IDevHost) => void) {
    this.change((props) => {
      const data = props.data || (props.data = {});
      const host = data.host || (data.host = { view: {} });
      fn(host);
    });
    return this;
  }

  private layout(fn: (props: t.IDevHostLayout) => void) {
    this.host((props) => fn(props.layout || (props.layout = {})));
    return this;
  }

  private component(fn: (props: t.IComponent) => void) {
    this.host((props) => fn(props.component || (props.component = { name: '' })));
    return this;
  }
}

/**
 * [Helpers]
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
