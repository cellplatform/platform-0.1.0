import * as t from '@platform/cell.types';

/**
 * Events
 */
export type FinderEvent = t.EnvEvent | IFinderRenderViewEvent;

export type IFinderRenderViewEvent = {
  type: 'FINDER/render/view';
  payload: IFinderRenderView;
};
export type IFinderRenderView = {
  node?: string; // Node ID.
  render(view: React.ReactNode): void;
};
