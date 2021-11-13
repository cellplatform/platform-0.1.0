import * as t from '../../common/types';

type Id = string;
type Index = number;
type O = Record<string, unknown>;

/**
 * A single positioning layer.
 */
export type PositioningLayer<P extends O = O> = {
  id: Id; // Layer addressable identifier.
  position: t.BoxPosition;
  props?: P;
  render?: PositioningLayerRender<P>;
};

/**
 * Render the content of a layer.
 */
export type PositioningLayerRender<P extends O = O> = (
  args: PositioningLayerRenderArgs<P>,
) => JSX.Element | undefined | null;

export type PositioningLayerRenderArgs<P extends O = O> = {
  index: Index; // Layer index (0-based).
  total: number; // Total number of layers (1-based).
  size: t.DomRect; // Root container size
  find: PositioningLayersQuery;
  position: t.BoxPosition;
  props: P;
};

/**
 * Query layers.
 * NB: edge wildcards supported on ID's (eg "*foo" or "foo*")
 *     or pass "*" (or nothing) to retrieve all layers.
 */
export type PositioningLayersQuery = {
  readonly all: PositioningLayerInfo[];
  index(index: Index): PositioningLayerInfo | undefined;
  first(id: Id): PositioningLayerInfo | undefined;
  match(id?: Id): PositioningLayerInfo[];
  overlap(input: Id | Index): PositioningLayerOverlapInfo[];
};

export type PositioningLayerInfo = {
  id: Id;
  index: Index;
  position: t.BoxPosition;
  size: t.DomRect; // Child element size.
};

export type PositioningLayerOverlapInfo = PositioningLayerInfo & {
  x: boolean;
  y: boolean;
};
