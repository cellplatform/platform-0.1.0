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
  find: PositioningLayoutQuery;
  position: t.BoxPosition;
  props: P;
};

/**
 * Query layers.
 * NB: edge wildcards supported on ID's (eg "*foo" or "foo*")
 *     or pass "*" (or nothing) to retrieve all layers.
 */
export type PositioningLayoutQuery = {
  readonly all: PositioningLayoutInfo[];
  index(index: Index): PositioningLayoutInfo | undefined;
  first(id: Id): PositioningLayoutInfo | undefined;
  match(id?: Id): PositioningLayoutInfo[];
  overlap(input: Id | Index): PositioningLayoutOverlapInfo[];
};

export type PositioningLayoutInfo = {
  id: Id;
  index: Index;
  position: t.BoxPosition;
  size: t.DomRect; // Child element size.
};

export type PositioningLayoutOverlapInfo = PositioningLayoutInfo & {
  x: boolean;
  y: boolean;
};
