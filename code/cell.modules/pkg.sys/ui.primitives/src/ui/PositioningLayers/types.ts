import * as t from '../../common/types';

/**
 * A single positioning layer.
 */
export type PositioningLayer = {
  position: t.BoxPosition;
  body?: JSX.Element | (() => JSX.Element);
};
