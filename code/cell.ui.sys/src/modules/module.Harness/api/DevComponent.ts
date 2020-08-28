import { t, Module, DEFAULT, id, R } from '../common';

type B = t.EventBus;
type P = t.DevProps;
type S = string;

type IArgs = { label: string; bus: B; module: t.DevModule };

/**
 * Represents a single component under test.
 */
export class DevComponent implements t.IDevComponent {
  /**
   * [Lifecycle]
   */

  public static create(args: IArgs): t.IDevComponent {
    return new DevComponent(args);
  }

  private constructor(args: IArgs) {
    this.bus = args.bus;
    this.module = args.module;

    const children = this.module.root.children || [];
    this.index = children.length;

    this.change((props) => (props.view = 'HOST/component'));
    this.label(args.label);

    const match: t.ModuleFilterEvent = (e) => e.module == this.module.id;
    this.events = Module.events<P>(Module.filter(this.bus.event$, match), this.module.dispose$);
  }

  /**
   * [Fields]
   */

  private readonly index: number;
  private readonly bus: B;
  private readonly module: t.DevModule;
  private readonly events: t.IViewModuleEvents<any>;

  /**
   * [Properties]
   */

  public get props(): t.DevProps {
    const children = this.module.root.children || [];
    const node = children[this.index];
    return R.clone(node.props || {});
  }

  /**
   * [Methods]
   */

  public render(fn: t.DevComponentRender) {
    const view = `uih-${id.shortid()}`;
    this.host((props) => (props.view = view));
    this.events.render(view).subscribe((e) => {
      const el = fn({});
      if (el) {
        e.render(el);
      }
    });
    return this;
  }

  public label(value: string) {
    value = (value || '').trim() || DEFAULT.UNTITLED;
    return this.treeview((props) => (props.label = value));
  }

  public width(value: number | string | undefined) {
    return this.layout((props) => (props.width = value));
  }

  public height(value: number | string | undefined) {
    return this.layout((props) => (props.height = value));
  }

  /**
   * [Helpers]
   */

  private change(fn: (props: P) => void) {
    this.module.change((draft, ctx) => {
      const index = this.index;
      const children = draft.children || (draft.children = []);
      const node = children[index] || { id: id.shortid() };
      const props = node.props || (node.props = {});
      props.view = 'HOST/component';
      fn(props);
      children[index] = node;
    });
    return this;
  }

  private treeview(fn: (props: t.ITreeviewNodeProps) => void) {
    this.change((props) => fn(props.treeview || (props.treeview = {})));
    return this;
  }

  private host(fn: (props: t.HarnessHost) => void) {
    this.change((props) => {
      const data = props.data || (props.data = {});
      const host = data.host || (data.host = {});
      fn(host);
    });
    return this;
  }

  private layout(fn: (props: t.HarnessHostLayout) => void) {
    this.host((props) => fn(props.layout || (props.layout = {})));
    return this;
  }
}
