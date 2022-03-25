import React, { useEffect, useRef, useState } from 'react';
import { animationFrameScheduler, Subject } from 'rxjs';
import { filter, debounceTime, observeOn, takeUntil } from 'rxjs/operators';

import { PositioningLayer } from '../PositioningLayer';
import { css, CssValue, t, useResizeObserver } from './common';
import { Query, Refs } from './Query';

export type PositioningLayoutSize = { size: t.DomRect; layers: t.PositioningLayerSize[] };
export type PositioningLayoutSizeHandler = (e: PositioningLayoutSize) => void;

export type PositioningLayoutProps = {
  layers?: t.PositioningLayer[];
  rootResize?: t.ResizeObserver;
  childPointerEvents?: 'none' | 'auto';
  style?: CssValue;
  onSize?: PositioningLayoutSizeHandler;
};

/**
 * Manages a stack of <PositioningContainer> elements as layers.
 */
export const PositioningLayout: React.FC<PositioningLayoutProps> = (props) => {
  const { layers = [] } = props;

  const [size, setSize] = useState<t.DomRect | undefined>();
  const [, setRedraw] = useState<number>(0);
  const redraw = () => setRedraw((prev) => prev + 1);

  const fireSizeRef = useRef<Subject<void>>(new Subject<void>());
  const layerRefs = useRef<Refs>({});
  const resize = useResizeObserver({ root: props.rootResize });

  /**
   * Lifecycle
   */
  useEffect(() => {
    // Keep track of size.
    const dispose$ = new Subject<void>();
    resize.$.pipe(takeUntil(dispose$)).subscribe((size) => setSize(size));

    // Dispose.
    return () => dispose$.next();
  }, []); // eslint-disable-line

  useEffect(() => {
    // Fire root "size changed" event.
    const dispose$ = new Subject<void>();
    const fireSize$ = fireSizeRef.current.pipe(
      takeUntil(dispose$),
      observeOn(animationFrameScheduler),
    );

    fireSize$.pipe(debounceTime(10)).subscribe((e) => {
      if (size) {
        props.onSize?.({
          size,
          layers: toLayerSizes({ refs: layerRefs.current, layers }),
        });
      }
    });

    return () => dispose$.next();
  }, [size, layers, layerRefs]); // eslint-disable-line

  useEffect(() => {
    // Ensure ID's are unique and not empty.
    const ids = layers.map(({ id }) => id);
    if (ids.some((id) => !(id ?? '').trim())) {
      throw new Error(`Layer id cannot be empty`);
    }
    if (ids.some((id) => id.includes('*'))) {
      throw new Error(`Layer id must not contain wildcards (*)`);
    }
    const duplicates = ids.filter((id, index) => index !== ids.indexOf(id));
    if (duplicates.length > 0) {
      throw new Error(`Duplicate layer id: ${duplicates.join(',')}`);
    }
  }, [layers]);

  /**
   * Render
   */
  const styles = {
    base: css({ position: 'relative' }),
    layer: {
      container: css({ Absolute: 0 }),
    },
  };

  const elLayers =
    size &&
    layers.map((layer, index) => {
      const find = Query(layers, layerRefs.current);
      return (
        <PositioningLayer
          key={`${layer.id}.${index}`}
          style={styles.layer.container}
          position={layer.position}
          rootResize={resize.root}
          childPointerEvents={props.childPointerEvents}
          onSize={(e) => {
            // Maintain a reference to the child size.
            const id = layer.id;
            const { parent: root, child, position } = e;
            layerRefs.current[id] = { id, position, size: { root, child } };

            // NB: Ensure children are updated with latest size state.
            redraw();
            fireSizeRef.current.next();
          }}
          onUnmount={() => {
            delete layerRefs.current[layer.id]; // Remove child reference.
          }}
        >
          {renderLayer({ index, layers, size, find })}
        </PositioningLayer>
      );
    });

  return (
    <div ref={resize.ref} {...css(styles.base, props.style)}>
      {elLayers}
    </div>
  );
};

/**
 * Helpers
 */

function renderLayer(args: {
  index: number;
  layers: t.PositioningLayer[];
  size: t.DomRect;
  find: t.PositioningLayoutQuery;
}) {
  const { index, layers, size, find } = args;
  const total = layers.length;
  const layer = layers[index];
  if (typeof layer?.render !== 'function') return null;

  const { position } = layer;
  const props = layer.props ?? {};
  return layer.render({ index, total, size, find, props, position }) ?? null;
}

function toLayerSizes(args: {
  refs: Refs;
  layers: t.PositioningLayer[];
}): t.PositioningLayerSize[] {
  return Object.values(args.refs)
    .map((ref) => {
      const { id, position } = ref;
      const size = ref.size.child;
      const index = args.layers.findIndex((layer) => layer.id === id);
      return { id, position, size, index };
    })
    .sort((a, b) => (a.index > b.index ? 1 : -1));
}
