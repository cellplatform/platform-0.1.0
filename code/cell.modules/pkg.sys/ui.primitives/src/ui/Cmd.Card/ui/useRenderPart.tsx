import { useEffect, useRef } from 'react';

import { rx, t } from '../common';
import { CmdCardEvents } from '../logic';

type O = Record<string, unknown>;

/**
 * Prepares render props for a child "part" of the <CmdCard>
 * NOTE:
 *    Protects against needless re-creation of card events API.
 */
export function useRenderPart<S extends O = O>(
  part: t.CmdCardPart,
  args: {
    instance: t.CmdCardInstance;
    size: t.DomRect;
    state: t.CmdCardState;
  },
) {
  const { instance, state, size } = args;
  const { bus } = instance;
  const busid = rx.bus.instance(instance.bus);
  const cardRef = useRef<undefined | t.CmdCardEventsDisposable>();

  console.log('use part', part);

  useEffect(() => {
    return () => {
      cardRef.current?.dispose();
      cardRef.current = undefined;
    };
  }, [instance.id, busid, part]);

  /**
   * Properties passed to the renderer (lazy).
   */
  type P = t.CmdCardRenderProps<S>;
  const props: P = {
    bus,
    size,

    get card() {
      if (!cardRef.current) cardRef.current = CmdCardEvents({ instance, initial: state });
      return cardRef.current.clone(); // NB: a un-disposable clone.
    },

    get state() {
      const api: P['state'] = {
        current: toPart<S>(state, part),
        async patch(fn) {
          const lens = props.card.state.lens<S>((root) => toPart(root, part));
          await lens.patch(fn);
        },
      };
      return api;
    },
  };

  /**
   * API
   */
  return {
    part,
    props,
    render(): JSX.Element | undefined | null {
      console.log('render', part, state);
      if (part === 'Body') return state.body.render?.(props);
      if (part === 'Backdrop') return state.backdrop.render?.(props);
      return null;
    },
  };
}

/**
 * [Helpers]
 */

function toPart<S extends O>(state: t.CmdCardState, part: t.CmdCardPart): S {
  if (part === 'Body') return state.body.state as S;
  if (part === 'Backdrop') return state.backdrop.state as S;
  throw new Error(`Card part '${part}' not supported`);
}
