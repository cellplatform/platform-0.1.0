import { Actions } from '../..';
import { StateObject, t } from '../../common';

type Ctx = {
  model: t.IStateObjectWritable<M>;
  change: t.IStateObjectWritable<M>['change'];
};
type M = { text?: string; position?: t.IHostLayoutAbsolute };

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec quam lorem. Praesent fermentum, augue ut porta varius, eros nisl euismod ante, ac suscipit elit libero nec dolor. Morbi magna enim, molestie non arcu id, varius sollicitudin neque. In sed quam mauris. Aenean mi nisl, elementum non arcu quis, ultrices tincidunt augue. Vivamus fermentum iaculis tellus finibus porttitor. Nulla eu purus id dolor auctor suscipit. Integer lacinia sapien at ante tempus volutpat.';

const model = StateObject.create<M>({ text: LOREM });

const change = (model: Ctx['model']) => {
  model.change((draft) => (draft.text = draft.text === 'hello' ? LOREM : 'hello'));
};

/**
 * Actions
 */
export const actions = Actions<Ctx>()
  .context((prev) => prev || { model, change: model.change })
  // .group('foo')
  .button('foo', (ctx) => change(ctx.model))
  .button((e) => e.label(LOREM))
  .button((e) => e.description(LOREM))

  .hr()
  .title('Group 1')

  .button('change text', (ctx) => change(ctx.model))
  .button((config) => config.label('hello'))
  .hr()
  .button('console.log', (ctx) => console.log('hello', ctx))
  // .group('Group 1', (e) =>
  //   e
  // )
  // .group((e) => e.name('Group 2'))

  .hr()
  .title('Group 2')

  .button('center (clear)', (ctx) => ctx.change((draft) => (draft.position = undefined)))
  .button('top left', (ctx) => ctx.change((draft) => (draft.position = { top: 50, left: 50 })))
  .hr()
  .title('color')
  .button('red', () => null)
  .button('green', () => null)
  .button('blue', () => null);
