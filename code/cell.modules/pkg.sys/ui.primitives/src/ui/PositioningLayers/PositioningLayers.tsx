import React, { useEffect, useRef, useState } from 'react';
import { animationFrameScheduler, Subject } from 'rxjs';
import { filter, debounceTime, observeOn, takeUntil } from 'rxjs/operators';

import { PositioningContainer } from '../PositioningContainer';
import { css, CssValue, t, useResizeObserver } from './common';
import { Query, Refs } from './Query';

export type PositioningLayersSize = { size: t.DomRect; layers: PositioningLayerSize[] };
export type PositioningLayersSizeHandler = (e: PositioningLayersSize) => void;
export type PositioningLayerSize = {
  id: string;
  index: number;
  position: t.BoxPosition;
  size: t.DomRect;
};

export type PositioningLayersProps = {
  layers?: t.PositioningLayer[];
  rootResize?: t.ResizeObserver;
  childPointerEvents?: 'none' | 'auto';
  style?: CssValue;
  onSize?: PositioningLayersSizeHandler;
};

/**
 * Manages a stack of <PositioningContainer> elements as layers.
 */
export const PositioningLayers: React.FC<PositioningLayersProps> = (props) => {
  const { layers = [] } = props;

  const [size, setSize] = useState<t.DomRect | undefined>();
  const [count, setRedraw] = useState<number>(0);
  const redraw = () => setRedraw((prev) => prev + 1);

  const fireSizeRef = useRef<Subject<void>>(new Subject<void>());
  const layerRefs = useRef<Refs>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const resize = useResizeObserver(rootRef, { root: props.rootResize });

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
        <PositioningContainer
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
        </PositioningContainer>
      );
    });

  return (
    <div
      ref={rootRef}
      {...css(styles.base, props.style)}
      className={'Sys-Primitives-PositioningLayers'}
    >
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
  find: t.PositioningLayersQuery;
}) {
  const { index, layers, size, find } = args;
  const total = layers.length;
  const layer = layers[index];
  if (typeof layer?.render !== 'function') return null;

  const { position } = layer;
  const props = layer.props ?? {};
  return layer.render({ index, total, size, find, props, position }) ?? null;
}

function toLayerSizes(args: { refs: Refs; layers: t.PositioningLayer[] }): PositioningLayerSize[] {
  return Object.values(args.refs)
    .map((ref) => {
      const { id, position } = ref;
      const size = ref.size.child;
      const index = args.layers.findIndex((layer) => layer.id === id);
      return { id, position, size, index };
    })
    .sort((a, b) => (a.index > b.index ? 1 : -1));
}
