import React, { useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PositioningContainer } from '../PositioningContainer';
import { css, CssValue, t, useResizeObserver } from './common';
import { Query, Refs } from './Query';

export type PositioningLayersProps = {
  layers?: t.PositioningLayer[];
  rootResize?: t.ResizeObserver;
  style?: CssValue;
};

/**
 * Manages a stack of <PositioningContainer> elements as layers.
 */
export const PositioningLayers: React.FC<PositioningLayersProps> = (props) => {
  const { layers = [] } = props;

  const [size, setSize] = useState<t.DomRect | undefined>();
  const [count, setRedraw] = useState<number>(0);
  const redraw = () => setRedraw((prev) => prev + 1);

  const layerRefs = useRef<Refs>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const resize = useResizeObserver(rootRef, { root: props.rootResize });

  /**
   * Lifecycle
   */
  useEffect(() => {
    const dispose$ = new Subject<void>();

    // Keep track of size.
    resize.$.pipe(takeUntil(dispose$)).subscribe((size) => setSize(size));

    return () => dispose$.next();
  }, []); // eslint-disable-line

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
          onSize={(e) => {
            // Maintain a reference to the child size.
            const id = layer.id;
            const { root, child } = e;
            layerRefs.current[id] = { id, size: { root, child } };
            redraw(); // NB: Ensure children are updated with latest size state.
          }}
          onUnmount={() => {
            // Remove child reference.
            delete layerRefs.current[layer.id];
          }}
        >
          {renderLayer({ index, layers, size, find })}
        </PositioningContainer>
      );
    });

  return (
    <div ref={rootRef} {...css(styles.base, props.style)}>
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
  const layer = layers[index];
  if (!layer) return null;

  if (typeof layer.el === 'object') return layer.el;

  if (typeof layer.el === 'function') {
    const total = layers.length;
    return layer.el({
      index,
      total,
      size: { root: size },
      find,
    });
  }

  return null;
}
