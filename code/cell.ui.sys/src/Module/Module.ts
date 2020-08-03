import { t } from '../common';
import { TreeState } from '@platform/state';

type O = Record<string, unknown>;
type Event = t.Event<O>;

export class Module {
  public static create<D extends O, A extends Event = any>(
    args?: t.ModuleArgs<D>,
  ): t.IModule<D, A> {
    return TreeState.create<t.ITreeNodeModule<D>>(args);
  }
}
