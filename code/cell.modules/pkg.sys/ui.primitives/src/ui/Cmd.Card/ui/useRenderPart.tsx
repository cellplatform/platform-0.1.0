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
      let _lens: t.JsonLens<S> | undefined;
      const api: P['state'] = {
        current: toPart<S>(state, part),
        async patch(fn) {
          const lens = _lens || (_lens = props.card.state.lens<S>((root) => toPart(root, part)));
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
      // if (part === 'Body') return state.body.render?.(props);
      if (part === 'Backdrop') return state.backdrop.render?.(props);
      return null;
    },
  };
}

/**
 * [Helpers]
 */

function toPart<S extends O>(state: t.CmdCardState, part: t.CmdCardPart): S {
  const done = (state: any): S => {
    if (state === null || typeof state !== 'object') {
      throw new Error(`CmdCard '${part}' state must be an {object}.`);
    }
    return state as S;
  };

  if (part === 'Backdrop') return done(state.backdrop.state);
  throw new Error(`CmdCard part '${part}' not supported`);
}
