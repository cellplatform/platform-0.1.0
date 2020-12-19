import { Actions } from 'sys.ui.harness';
import { StateObject, t } from '../../common';

type M = { count: number };
type Ctx = { model: t.IStateObjectWritable<M> };

const model = StateObject.create<M>({ count: 0 });

console.log('__CELL__', __CELL__);

export const actions = Actions<Ctx>()
  .context((prev) => prev || { model })
  .group('sys.ui.editor.code', (e) => e.button('foo', () => null));
