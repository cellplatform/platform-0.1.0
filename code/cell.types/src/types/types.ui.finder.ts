import { t } from '../common';

/**
 * Events
 */
export type FinderEvent = t.EnvEvent | IFinderRenderViewEvent;

export type IFinderRenderViewEvent = {
  type: 'FINDER/render/view';
  payload: IFinderRenderView;
};
export type IFinderRenderView = {
  node?: string; // ID.
  render(view: React.ReactNode): void;
};
