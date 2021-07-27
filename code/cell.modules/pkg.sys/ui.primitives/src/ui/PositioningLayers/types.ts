import * as t from '../../common/types';

type Id = string;
type Index = number;

/**
 * A single positioning layer.
 */
export type PositioningLayer = {
  id: Id; // Layer addressable identifier.
  position: t.BoxPosition;
  el?: JSX.Element | PositioningLayerRender;
};

/**
 * Render the content of a layer.
 */
export type PositioningLayerRender = (
  e: PositioningLayerRenderArgs,
) => JSX.Element | undefined | null;

export type PositioningLayerRenderArgs = {
  index: Index; // Layer index (0-based).
  total: number; // Total number of layers (1-based).
  size: t.DomRect; // Root container size
  find: PositioningLayersQuery;
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
