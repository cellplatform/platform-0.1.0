import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css, StateObject, t } from '../common';
import { Actions } from '..';
import { Host } from '../components/Host';

type Ctx = { model: t.IStateObjectWritable<M> };
type M = { text?: string };

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec quam lorem. Praesent fermentum, augue ut porta varius, eros nisl euismod ante, ac suscipit elit libero nec dolor. Morbi magna enim, molestie non arcu id, varius sollicitudin neque. In sed quam mauris. Aenean mi nisl, elementum non arcu quis, ultrices tincidunt augue. Vivamus fermentum iaculis tellus finibus porttitor. Nulla eu purus id dolor auctor suscipit. Integer lacinia sapien at ante tempus volutpat.';

const model = StateObject.create<M>({ text: LOREM });

const actions = Actions<Ctx>('My Title')
  .context((prev) => prev || { model })
  .button('foo', (ctx) => {
    ctx.model.change((draft) => (draft.text = draft.text === 'hello' ? LOREM : 'hello'));
  })
  .button((e) => e.label(LOREM))
  .button((e) => e.description(LOREM))
  .group('Group 1', (e) =>
    e
      .button('change text', (ctx) =>
        ctx.model.change((draft) => (draft.text = draft.text === 'hello' ? LOREM : 'hello')),
      )
      .button((config) => config.label('hello')),
  )
  .group((e) => e.name('Group 2'));

export const Dev: React.FC = () => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const dispose$ = new Subject();
    model.event.changed$.pipe(takeUntil(dispose$)).subscribe((e) => setCount(count + 1));
    return () => dispose$.next();
  });

  const styles = {
    base: css({
      Absolute: 0,
      Flex: 'horizontal-stretch-stretch',
    }),
    left: css({
      position: 'relative',
      flex: 1,
    }),
    right: css({
      display: 'flex',
      position: 'relative',
      width: 300,
      backgroundColor: color.format(-0.03),
      borderLeft: `solid 1px ${color.format(-0.08)}`,
    }),
    host: css({
      Absolute: 50,
      border: `solid 5px ${color.format(-0.1)}`,
      boxSizing: 'border-box',
    }),
    content: css({
      padding: 20,
    }),
  };

  return (
    <React.StrictMode>
      <div {...styles.base}>
        <div {...styles.left}>
          <Host
            style={styles.host}
            background={-0.04}
            layout={{
              width: 550,
              border: -0.1,
              cropmarks: -0.2,
              background: 1,
              // label: {
              //   topLeft: 'top-left',
              //   topRight: 'top-right',
              //   bottomLeft: 'bottom-left',
              //   bottomRight: 'bottom-right',
              // },
              label: 'foobar',
            }}
          >
            <div {...styles.content}>
              {count}. {model.state.text}
            </div>
          </Host>
        </div>
        <div {...styles.right}>{actions.render({ style: { flex: 1 } })}</div>
      </div>
    </React.StrictMode>
  );
};
